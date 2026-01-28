import axios from 'axios';
import { StockPrice, StockHistory } from '../../types';
import { env } from '../../config/env';
import { getMarketStatus } from '../../utils/calculations';
import logger from '../../utils/logger';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = env.finnhubApiKey;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = `${FINNHUB_BASE_URL}${endpoint}`;
    
    try {
      const response = await axios.get<T>(url, {
        params: {
          ...params,
          token: this.apiKey,
        },
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Finnhub API key');
        }
        if (error.response?.status === 429) {
          throw new Error('Finnhub rate limit exceeded');
        }
        throw new Error(`Finnhub API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<StockPrice> {
    interface FinnhubQuoteResponse {
      c: number;  // Current price
      d: number;  // Change
      dp: number; // Percent change
      h: number;  // High
      l: number;  // Low
      o: number;  // Open
      pc: number; // Previous close
      t: number;  // Timestamp
    }

    const data = await this.makeRequest<FinnhubQuoteResponse>('/quote', {
      symbol: symbol.toUpperCase(),
    });

    if (!data.c || data.c === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      marketStatus: getMarketStatus(),
      lastUpdate: new Date(),
      source: 'finnhub',
    };
  }

  async getQuotes(symbols: string[]): Promise<StockPrice[]> {
    const results: StockPrice[] = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        results.push(quote);
      } catch (error) {
        logger.warn(`Failed to fetch ${symbol} from Finnhub: ${(error as Error).message}`);
      }
    }
    
    return results;
  }

  async getHistory(symbol: string, days: number = 7): Promise<StockHistory> {
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 24 * 60 * 60;
    const resolution = days <= 5 ? '60' : 'D';

    interface FinnhubCandleResponse {
      c: number[];  // Close prices
      h: number[];  // High prices
      l: number[];  // Low prices
      o: number[];  // Open prices
      s: string;    // Status
      t: number[];  // Timestamps
      v: number[];  // Volumes
    }

    const data = await this.makeRequest<FinnhubCandleResponse>('/stock/candle', {
      symbol: symbol.toUpperCase(),
      resolution,
      from: from.toString(),
      to: now.toString(),
    });

    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      throw new Error(`No history data for symbol: ${symbol}`);
    }

    const historyData = data.t.map((ts, i) => ({
      timestamp: new Date(ts * 1000),
      price: data.c[i] ?? 0,
      volume: data.v[i],
    }));

    return {
      symbol: symbol.toUpperCase(),
      data: historyData,
      source: 'finnhub',
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const finnhubService = new FinnhubService();
