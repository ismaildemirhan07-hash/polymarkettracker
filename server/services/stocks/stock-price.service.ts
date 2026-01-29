import axios from 'axios';
import { cacheService } from '../../config/redis';
import { logger } from '../../utils/logger';

const FINNHUB_API = 'https://finnhub.io/api/v1';
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance';
const CACHE_TTL = 60; // 1 minute for stock prices

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export class StockPriceService {
  /**
   * Get stock price using Yahoo Finance (free, no API key)
   */
  static async getPrice(symbol: string): Promise<number | null> {
    try {
      const cacheKey = `stock:price:${symbol.toUpperCase()}`;
      const cached = await cacheService.get<number>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Yahoo Finance API endpoint
      const response = await axios.get(`${YAHOO_FINANCE_API}/chart/${symbol.toUpperCase()}`, {
        params: {
          interval: '1m',
          range: '1d'
        },
        timeout: 5000
      });

      const data = response.data?.chart?.result?.[0];
      if (!data || !data.meta?.regularMarketPrice) {
        logger.warn(`No price data for ${symbol}`);
        return null;
      }

      const price = data.meta.regularMarketPrice;
      await cacheService.set(cacheKey, price, CACHE_TTL);
      
      return price;
    } catch (error) {
      logger.error(`Error fetching ${symbol} price:`, error);
      return null;
    }
  }

  /**
   * Extract stock symbol from market title
   */
  static extractSymbolFromTitle(title: string): string | null {
    // Common stock patterns in titles
    const patterns = [
      /\b(AAPL|APPLE)\b/i,
      /\b(TSLA|TESLA)\b/i,
      /\b(NVDA|NVIDIA)\b/i,
      /\b(MSFT|MICROSOFT)\b/i,
      /\b(GOOGL|GOOGLE|ALPHABET)\b/i,
      /\b(AMZN|AMAZON)\b/i,
      /\b(META|FACEBOOK)\b/i,
      /\b(NFLX|NETFLIX)\b/i,
    ];

    const symbolMap: Record<string, string> = {
      'APPLE': 'AAPL',
      'TESLA': 'TSLA',
      'NVIDIA': 'NVDA',
      'MICROSOFT': 'MSFT',
      'GOOGLE': 'GOOGL',
      'ALPHABET': 'GOOGL',
      'AMAZON': 'AMZN',
      'FACEBOOK': 'META',
      'NETFLIX': 'NFLX',
    };

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        const matched = match[1].toUpperCase();
        return symbolMap[matched] || matched;
      }
    }

    return null;
  }

  /**
   * Get multiple stock prices
   */
  static async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    await Promise.all(
      symbols.map(async (symbol) => {
        const price = await this.getPrice(symbol);
        if (price) {
          prices[symbol] = price;
        }
      })
    );

    return prices;
  }
}
