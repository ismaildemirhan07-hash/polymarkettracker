import { StockPrice, StockHistory } from '../../types';
import { cacheService } from '../../config/redis';
import { env } from '../../config/env';
import { yahooService } from './yahoo.service';
import { finnhubService } from './finnhub.service';
import { getMarketStatus, isMarketHours } from '../../utils/calculations';
import logger from '../../utils/logger';

export class StocksService {
  private cacheTTL: number;
  private afterHoursCacheTTL: number;

  constructor() {
    this.cacheTTL = env.cacheTTL.stock;
    this.afterHoursCacheTTL = 3600;
  }

  private getCacheTTL(): number {
    return isMarketHours() ? this.cacheTTL : this.afterHoursCacheTTL;
  }

  async getQuote(symbol: string): Promise<StockPrice> {
    const cacheKey = `stock:quote:${symbol.toUpperCase()}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<StockPrice>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching ${symbol} quote from Yahoo Finance`);
            return await yahooService.getQuote(symbol);
          } catch (error) {
            logger.warn(`Yahoo failed for ${symbol}, trying Finnhub: ${(error as Error).message}`);
            if (finnhubService.isConfigured()) {
              return await finnhubService.getQuote(symbol);
            }
            throw error;
          }
        },
        this.getCacheTTL()
      );

      if (cached) {
        logger.debug(`Cache hit for ${symbol} quote`);
      }

      return data;
    } catch (error) {
      logger.error(`All stock APIs failed for ${symbol}: ${(error as Error).message}`);

      const cached = await cacheService.get<StockPrice>(cacheKey);
      if (cached) {
        return {
          ...cached,
          stale: true,
          warning: 'Using cached data - live APIs unavailable',
        };
      }

      throw new Error(`Unable to fetch quote for ${symbol}`);
    }
  }

  async getQuotes(symbols: string[]): Promise<StockPrice[]> {
    const cacheKey = `stock:quotes:${symbols.sort().join(',')}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<StockPrice[]>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching quotes for ${symbols.join(', ')} from Yahoo Finance`);
            return await yahooService.getQuotes(symbols);
          } catch (error) {
            logger.warn(`Yahoo failed for bulk quotes, trying Finnhub: ${(error as Error).message}`);
            if (finnhubService.isConfigured()) {
              return await finnhubService.getQuotes(symbols);
            }
            throw error;
          }
        },
        this.getCacheTTL()
      );

      if (cached) {
        logger.debug(`Cache hit for bulk stock quotes`);
      }

      return data;
    } catch (error) {
      logger.error(`All stock APIs failed for bulk quotes: ${(error as Error).message}`);

      const results: StockPrice[] = [];
      for (const symbol of symbols) {
        const cached = await cacheService.get<StockPrice>(`stock:quote:${symbol}`);
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

      throw new Error('Unable to fetch stock quotes');
    }
  }

  async getHistory(symbol: string, days: number = 7): Promise<StockHistory> {
    const cacheKey = `stock:history:${symbol.toUpperCase()}:${days}`;
    const historyTTL = days <= 1 ? 300 : 1800;

    try {
      const { data, cached } = await cacheService.getOrFetch<StockHistory>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching ${symbol} history from Yahoo Finance`);
            return await yahooService.getHistory(symbol, days);
          } catch (error) {
            logger.warn(`Yahoo history failed, trying Finnhub: ${(error as Error).message}`);
            if (finnhubService.isConfigured()) {
              return await finnhubService.getHistory(symbol, days);
            }
            throw error;
          }
        },
        historyTTL
      );

      if (cached) {
        logger.debug(`Cache hit for ${symbol} history`);
      }

      return data;
    } catch (error) {
      logger.error(`All stock APIs failed for ${symbol} history: ${(error as Error).message}`);
      throw new Error(`Unable to fetch history for ${symbol}`);
    }
  }

  getMarketStatus(): StockPrice['marketStatus'] {
    return getMarketStatus();
  }
}

export const stocksService = new StocksService();
