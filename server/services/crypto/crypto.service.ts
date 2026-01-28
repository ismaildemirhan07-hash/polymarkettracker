import { CryptoPrice, CryptoHistory } from '../../types';
import { cacheService } from '../../config/redis';
import { env } from '../../config/env';
import { coinGeckoService } from './coingecko.service';
import { binanceService } from './binance.service';
import logger from '../../utils/logger';

export class CryptoService {
  private cacheTTL: number;

  constructor() {
    this.cacheTTL = env.cacheTTL.crypto;
  }

  async getPrice(symbol: string): Promise<CryptoPrice> {
    const cacheKey = `crypto:price:${symbol.toUpperCase()}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<CryptoPrice>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching ${symbol} price from CoinGecko`);
            return await coinGeckoService.getPrice(symbol);
          } catch (error) {
            logger.warn(`CoinGecko failed for ${symbol}, trying Binance: ${(error as Error).message}`);
            return await binanceService.getPrice(symbol);
          }
        },
        this.cacheTTL
      );

      if (cached) {
        logger.debug(`Cache hit for ${symbol} price`);
      }

      return data;
    } catch (error) {
      logger.error(`All crypto APIs failed for ${symbol}: ${(error as Error).message}`);
      
      const cached = await cacheService.get<CryptoPrice>(cacheKey);
      if (cached) {
        return {
          ...cached,
          stale: true,
          warning: 'Using cached data - live APIs unavailable',
        };
      }

      throw new Error(`Unable to fetch price for ${symbol}`);
    }
  }

  async getPrices(symbols: string[]): Promise<CryptoPrice[]> {
    const cacheKey = `crypto:prices:${symbols.sort().join(',')}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<CryptoPrice[]>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching prices for ${symbols.join(', ')} from CoinGecko`);
            return await coinGeckoService.getPrices(symbols);
          } catch (error) {
            logger.warn(`CoinGecko failed, trying Binance: ${(error as Error).message}`);
            return await binanceService.getPrices(symbols);
          }
        },
        this.cacheTTL
      );

      if (cached) {
        logger.debug(`Cache hit for bulk prices`);
      }

      return data;
    } catch (error) {
      logger.error(`All crypto APIs failed for bulk prices: ${(error as Error).message}`);

      const results: CryptoPrice[] = [];
      for (const symbol of symbols) {
        const cached = await cacheService.get<CryptoPrice>(`crypto:price:${symbol}`);
        if (cached) {
          results.push({
            ...cached,
            stale: true,
            warning: 'Using cached data',
          });
        }
      }

      if (results.length > 0) {
        return results;
      }

      throw new Error('Unable to fetch crypto prices');
    }
  }

  async getHistory(symbol: string, days: number = 7): Promise<CryptoHistory> {
    const cacheKey = `crypto:history:${symbol.toUpperCase()}:${days}`;
    const historyTTL = days <= 1 ? 300 : 1800;

    try {
      const { data, cached } = await cacheService.getOrFetch<CryptoHistory>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching ${symbol} history from CoinGecko`);
            return await coinGeckoService.getHistory(symbol, days);
          } catch (error) {
            logger.warn(`CoinGecko history failed, trying Binance: ${(error as Error).message}`);
            return await binanceService.getHistory(symbol, days);
          }
        },
        historyTTL
      );

      if (cached) {
        logger.debug(`Cache hit for ${symbol} history`);
      }

      return data;
    } catch (error) {
      logger.error(`All crypto APIs failed for ${symbol} history: ${(error as Error).message}`);
      throw new Error(`Unable to fetch history for ${symbol}`);
    }
  }

  getSupportedSymbols(): string[] {
    return coinGeckoService.getSupportedSymbols();
  }

  isSupported(symbol: string): boolean {
    return coinGeckoService.isSupported(symbol) || binanceService.isSupported(symbol);
  }
}

export const cryptoService = new CryptoService();
