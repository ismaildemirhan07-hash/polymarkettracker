import axios from 'axios';
import { CryptoPrice, CryptoHistory, CryptoHistoryPoint } from '../../types';
import logger from '../../utils/logger';

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

const SYMBOL_TO_PAIR: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  MATIC: 'MATICUSDT',
  DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT',
  LINK: 'LINKUSDT',
  AVAX: 'AVAXUSDT',
  DOT: 'DOTUSDT',
  XRP: 'XRPUSDT',
  BNB: 'BNBUSDT',
  SHIB: 'SHIBUSDT',
  LTC: 'LTCUSDT',
  UNI: 'UNIUSDT',
  ATOM: 'ATOMUSDT',
  XLM: 'XLMUSDT',
  ALGO: 'ALGOUSDT',
  FTM: 'FTMUSDT',
  NEAR: 'NEARUSDT',
  APT: 'APTUSDT',
};

export class BinanceService {
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = `${BINANCE_BASE_URL}${endpoint}`;
    
    try {
      const response = await axios.get<T>(url, {
        params,
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Binance rate limit exceeded');
        }
        throw new Error(`Binance API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<CryptoPrice> {
    const pair = SYMBOL_TO_PAIR[symbol.toUpperCase()];
    if (!pair) {
      throw new Error(`Unsupported crypto symbol: ${symbol}`);
    }

    interface TickerResponse {
      symbol: string;
      price: string;
    }

    interface Ticker24hResponse {
      symbol: string;
      priceChangePercent: string;
    }

    const [priceData, changeData] = await Promise.all([
      this.makeRequest<TickerResponse>('/ticker/price', { symbol: pair }),
      this.makeRequest<Ticker24hResponse>('/ticker/24hr', { symbol: pair }),
    ]);

    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(priceData.price),
      change24h: parseFloat(changeData.priceChangePercent),
      lastUpdate: new Date(),
      source: 'binance',
    };
  }

  async getPrices(symbols: string[]): Promise<CryptoPrice[]> {
    const pairs = symbols
      .map((s) => SYMBOL_TO_PAIR[s.toUpperCase()])
      .filter(Boolean);

    if (pairs.length === 0) {
      throw new Error('No valid crypto symbols provided');
    }

    interface TickerResponse {
      symbol: string;
      price: string;
    }

    interface Ticker24hResponse {
      symbol: string;
      priceChangePercent: string;
    }

    const [pricesData, changesData] = await Promise.all([
      this.makeRequest<TickerResponse[]>('/ticker/price', { symbols: JSON.stringify(pairs) }),
      this.makeRequest<Ticker24hResponse[]>('/ticker/24hr', { symbols: JSON.stringify(pairs) }),
    ]);

    const pairToSymbol = Object.entries(SYMBOL_TO_PAIR).reduce(
      (acc, [sym, pair]) => ({ ...acc, [pair]: sym }),
      {} as Record<string, string>
    );

    const changesMap = new Map(
      changesData.map((c) => [c.symbol, parseFloat(c.priceChangePercent)])
    );

    return pricesData.map((p) => ({
      symbol: pairToSymbol[p.symbol] || p.symbol.replace('USDT', ''),
      price: parseFloat(p.price),
      change24h: changesMap.get(p.symbol) || 0,
      lastUpdate: new Date(),
      source: 'binance' as const,
    }));
  }

  async getHistory(symbol: string, days: number = 7): Promise<CryptoHistory> {
    const pair = SYMBOL_TO_PAIR[symbol.toUpperCase()];
    if (!pair) {
      throw new Error(`Unsupported crypto symbol: ${symbol}`);
    }

    const interval = days <= 1 ? '1h' : days <= 7 ? '4h' : '1d';
    const limit = days <= 1 ? 24 : days <= 7 ? days * 6 : days;

    type KlineResponse = [
      number, string, string, string, string, string, number, string, number, string, string, string
    ][];

    const data = await this.makeRequest<KlineResponse>('/klines', {
      symbol: pair,
      interval,
      limit: limit.toString(),
    });

    const historyData: CryptoHistoryPoint[] = data.map((kline) => ({
      timestamp: new Date(kline[0]),
      price: parseFloat(kline[4]),
    }));

    return {
      symbol: symbol.toUpperCase(),
      data: historyData,
      source: 'binance',
    };
  }

  getSupportedSymbols(): string[] {
    return Object.keys(SYMBOL_TO_PAIR);
  }

  isSupported(symbol: string): boolean {
    return symbol.toUpperCase() in SYMBOL_TO_PAIR;
  }
}

export const binanceService = new BinanceService();
