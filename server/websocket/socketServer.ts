import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from '../config/database';
import { cryptoService } from '../services/crypto/crypto.service';
import { weatherService } from '../services/weather/weather.service';
import { stocksService } from '../services/stocks/stocks.service';
import { calculateDistance, determineStatus } from '../utils/calculations';
import { env } from '../config/env';
import logger from '../utils/logger';

let io: Server | null = null;

export function initializeWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('subscribe', (betIds: string[]) => {
      if (Array.isArray(betIds)) {
        betIds.forEach((id) => socket.join(`bet:${id}`));
        logger.debug(`Client ${socket.id} subscribed to bets: ${betIds.join(', ')}`);
      }
    });

    socket.on('unsubscribe', (betIds: string[]) => {
      if (Array.isArray(betIds)) {
        betIds.forEach((id) => socket.leave(`bet:${id}`));
        logger.debug(`Client ${socket.id} unsubscribed from bets: ${betIds.join(', ')}`);
      }
    });

    socket.on('subscribe-prices', (symbols: string[]) => {
      if (Array.isArray(symbols)) {
        symbols.forEach((symbol) => socket.join(`price:${symbol.toUpperCase()}`));
        logger.debug(`Client ${socket.id} subscribed to prices: ${symbols.join(', ')}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  startPriceUpdates();

  logger.info('WebSocket server initialized');
  return io;
}

async function startPriceUpdates(): Promise<void> {
  const UPDATE_INTERVAL = 60000;

  setInterval(async () => {
    if (!io) return;

    try {
      const activeBets = await prisma.bet.findMany({
        where: { resolved: false },
        select: { id: true, asset: true, type: true, threshold: true, position: true },
      });

      const cryptoAssets = [...new Set(activeBets.filter((b) => b.type === 'crypto').map((b) => b.asset))];
      const stockAssets = [...new Set(activeBets.filter((b) => b.type === 'stock').map((b) => b.asset))];
      const weatherAssets = [...new Set(activeBets.filter((b) => b.type === 'weather').map((b) => b.asset))];

      if (cryptoAssets.length > 0) {
        try {
          const prices = await cryptoService.getPrices(cryptoAssets);
          prices.forEach((price) => {
            io?.emit('price-update', {
              type: 'crypto',
              symbol: price.symbol,
              price: price.price,
              change24h: price.change24h,
              timestamp: new Date(),
            });

            io?.to(`price:${price.symbol}`).emit('price-update', {
              type: 'crypto',
              symbol: price.symbol,
              price: price.price,
              change24h: price.change24h,
              timestamp: new Date(),
            });
          });

          const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));
          for (const bet of activeBets.filter((b) => b.type === 'crypto')) {
            const currentPrice = priceMap.get(bet.asset);
            if (currentPrice !== undefined) {
              const distance = calculateDistance(currentPrice, bet.threshold, bet.position as 'YES' | 'NO');
              const status = determineStatus(currentPrice, bet.threshold, bet.position as 'YES' | 'NO');

              io?.to(`bet:${bet.id}`).emit('bet-update', {
                betId: bet.id,
                currentValue: currentPrice,
                distance: distance.distancePercent,
                isWinning: distance.isWinning,
                status,
                timestamp: new Date(),
              });
            }
          }
        } catch (error) {
          logger.error(`Failed to fetch crypto prices for WebSocket: ${(error as Error).message}`);
        }
      }

      if (stockAssets.length > 0) {
        try {
          const quotes = await stocksService.getQuotes(stockAssets);
          quotes.forEach((quote) => {
            io?.emit('price-update', {
              type: 'stock',
              symbol: quote.symbol,
              price: quote.price,
              change: quote.changePercent,
              marketStatus: quote.marketStatus,
              timestamp: new Date(),
            });
          });

          const quoteMap = new Map(quotes.map((q) => [q.symbol, q.price]));
          for (const bet of activeBets.filter((b) => b.type === 'stock')) {
            const currentPrice = quoteMap.get(bet.asset);
            if (currentPrice !== undefined) {
              const distance = calculateDistance(currentPrice, bet.threshold, bet.position as 'YES' | 'NO');
              const status = determineStatus(currentPrice, bet.threshold, bet.position as 'YES' | 'NO');

              io?.to(`bet:${bet.id}`).emit('bet-update', {
                betId: bet.id,
                currentValue: currentPrice,
                distance: distance.distancePercent,
                isWinning: distance.isWinning,
                status,
                timestamp: new Date(),
              });
            }
          }
        } catch (error) {
          logger.error(`Failed to fetch stock prices for WebSocket: ${(error as Error).message}`);
        }
      }

      if (weatherAssets.length > 0) {
        for (const asset of weatherAssets) {
          try {
            const cityName = asset.replace(/_/g, ' ');
            const weather = await weatherService.getCurrentWeather(cityName);

            io?.emit('weather-update', {
              type: 'weather',
              city: weather.city,
              temperature: weather.temperature,
              condition: weather.condition,
              timestamp: new Date(),
            });

            for (const bet of activeBets.filter((b) => b.type === 'weather' && b.asset === asset)) {
              const distance = calculateDistance(weather.temperature, bet.threshold, bet.position as 'YES' | 'NO');
              const status = determineStatus(weather.temperature, bet.threshold, bet.position as 'YES' | 'NO');

              io?.to(`bet:${bet.id}`).emit('bet-update', {
                betId: bet.id,
                currentValue: weather.temperature,
                distance: distance.distancePercent,
                isWinning: distance.isWinning,
                status,
                timestamp: new Date(),
              });
            }
          } catch (error) {
            logger.error(`Failed to fetch weather for ${asset}: ${(error as Error).message}`);
          }
        }
      }

      logger.debug('WebSocket price updates sent');
    } catch (error) {
      logger.error(`WebSocket update error: ${(error as Error).message}`);
    }
  }, UPDATE_INTERVAL);
}

export function getIO(): Server | null {
  return io;
}

export function broadcastToAll(event: string, data: unknown): void {
  if (io) {
    io.emit(event, data);
  }
}
