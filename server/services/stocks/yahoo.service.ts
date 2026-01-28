import axios from 'axios';
import { StockPrice, StockHistory } from '../../types';
import { getMarketStatus } from '../../utils/calculations';
import logger from '../../utils/logger';

const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export class YahooService {
  private async makeRequest<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const response = await axios.get<T>(url, {
        params,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Yahoo Finance API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<StockPrice> {
    interface YahooQuoteResponse {
      quoteResponse: {
        result: Array<{
          symbol: string;
          regularMarketPrice: number;
          regularMarketChange: number;
          regularMarketChangePercent: number;
          marketState: string;
        }>;
        error: null | { code: string; description: string };
      };
    }

    const data = await this.makeRequest<YahooQuoteResponse>(YAHOO_QUOTE_URL, {
      symbols: symbol.toUpperCase(),
    });

    if (data.quoteResponse.error) {
      throw new Error(`Yahoo API error: ${data.quoteResponse.error.description}`);
    }

    const quote = data.quoteResponse.result[0];
    if (!quote) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const marketStateMap: Record<string, StockPrice['marketStatus']> = {
      'REGULAR': 'open',
      'PRE': 'pre-market',
      'POST': 'after-hours',
      'CLOSED': 'closed',
      'PREPRE': 'pre-market',
      'POSTPOST': 'after-hours',
    };

    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketStatus: marketStateMap[quote.marketState] || 'closed',
      lastUpdate: new Date(),
      source: 'yahoo',
    };
  }

  async getQuotes(symbols: string[]): Promise<StockPrice[]> {
    interface YahooQuoteResponse {
      quoteResponse: {
        result: Array<{
          symbol: string;
          regularMarketPrice: number;
          regularMarketChange: number;
          regularMarketChangePercent: number;
          marketState: string;
        }>;
        error: null | { code: string; description: string };
      };
    }

    const data = await this.makeRequest<YahooQuoteResponse>(YAHOO_QUOTE_URL, {
      symbols: symbols.map((s) => s.toUpperCase()).join(','),
    });

    if (data.quoteResponse.error) {
      throw new Error(`Yahoo API error: ${data.quoteResponse.error.description}`);
    }

    const marketStateMap: Record<string, StockPrice['marketStatus']> = {
      'REGULAR': 'open',
      'PRE': 'pre-market',
      'POST': 'after-hours',
      'CLOSED': 'closed',
    };

    return data.quoteResponse.result.map((quote) => ({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketStatus: marketStateMap[quote.marketState] || 'closed',
      lastUpdate: new Date(),
      source: 'yahoo' as const,
    }));
  }

  async getHistory(symbol: string, days: number = 7): Promise<StockHistory> {
    const interval = days <= 5 ? '1h' : '1d';
    const range = days <= 5 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : '1y';

    interface YahooChartResponse {
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: {
            quote: Array<{
              close: (number | null)[];
              volume: (number | null)[];
            }>;
          };
        }>;
        error: null | { code: string; description: string };
      };
    }

    const data = await this.makeRequest<YahooChartResponse>(
      `${YAHOO_CHART_URL}/${symbol.toUpperCase()}`,
      { interval, range }
    );

    if (data.chart.error) {
      throw new Error(`Yahoo API error: ${data.chart.error.description}`);
    }

    const result = data.chart.result[0];
    if (!result) {
      throw new Error(`No history data for symbol: ${symbol}`);
    }

    const quotes = result.indicators.quote[0];
    if (!quotes) {
      throw new Error(`No quote data for symbol: ${symbol}`);
    }

    const historyData = result.timestamp
      .map((ts, i) => ({
        timestamp: new Date(ts * 1000),
        price: quotes.close[i] ?? 0,
        volume: quotes.volume[i] ?? undefined,
      }))
      .filter((point) => point.price > 0);

    return {
      symbol: symbol.toUpperCase(),
      data: historyData,
      source: 'yahoo',
    };
  }
}

export const yahooService = new YahooService();
