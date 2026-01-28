import axios from 'axios';
import { CryptoPrice, CryptoHistory, CryptoHistoryPoint } from '../../types';
import logger from '../../utils/logger';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  MATIC: 'matic-network',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  LINK: 'chainlink',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  XRP: 'ripple',
  BNB: 'binancecoin',
  SHIB: 'shiba-inu',
  LTC: 'litecoin',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XLM: 'stellar',
  ALGO: 'algorand',
  FTM: 'fantom',
  NEAR: 'near',
  APT: 'aptos',
};

export class CoinGeckoService {
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = `${COINGECKO_BASE_URL}${endpoint}`;
    
    try {
      const response = await axios.get<T>(url, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('CoinGecko rate limit exceeded');
        }
        throw new Error(`CoinGecko API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<CryptoPrice> {
    const coinId = SYMBOL_TO_ID[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported crypto symbol: ${symbol}`);
    }

    interface PriceResponse {
      [key: string]: {
        usd: number;
        usd_24h_change: number;
      };
    }

    const data = await this.makeRequest<PriceResponse>('/simple/price', {
      ids: coinId,
      vs_currencies: 'usd',
      include_24hr_change: 'true',
    });

    const coinData = data[coinId];
    if (!coinData) {
      throw new Error(`No data returned for ${symbol}`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
      lastUpdate: new Date(),
      source: 'coingecko',
    };
  }

  async getPrices(symbols: string[]): Promise<CryptoPrice[]> {
    const coinIds = symbols
      .map((s) => SYMBOL_TO_ID[s.toUpperCase()])
      .filter(Boolean);

    if (coinIds.length === 0) {
      throw new Error('No valid crypto symbols provided');
    }

    interface PriceResponse {
      [key: string]: {
        usd: number;
        usd_24h_change: number;
      };
    }

    const data = await this.makeRequest<PriceResponse>('/simple/price', {
      ids: coinIds.join(','),
      vs_currencies: 'usd',
      include_24hr_change: 'true',
    });

    const idToSymbol = Object.entries(SYMBOL_TO_ID).reduce(
      (acc, [sym, id]) => ({ ...acc, [id]: sym }),
      {} as Record<string, string>
    );

    return Object.entries(data).map(([coinId, coinData]) => ({
      symbol: idToSymbol[coinId] || coinId.toUpperCase(),
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
      lastUpdate: new Date(),
      source: 'coingecko' as const,
    }));
  }

  async getHistory(symbol: string, days: number = 7): Promise<CryptoHistory> {
    const coinId = SYMBOL_TO_ID[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported crypto symbol: ${symbol}`);
    }

    interface HistoryResponse {
      prices: [number, number][];
    }

    const data = await this.makeRequest<HistoryResponse>(`/coins/${coinId}/market_chart`, {
      vs_currency: 'usd',
      days: days.toString(),
    });

    const historyData: CryptoHistoryPoint[] = data.prices.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp),
      price,
    }));

    return {
      symbol: symbol.toUpperCase(),
      data: historyData,
      source: 'coingecko',
    };
  }

  getSupportedSymbols(): string[] {
    return Object.keys(SYMBOL_TO_ID);
  }

  isSupported(symbol: string): boolean {
    return symbol.toUpperCase() in SYMBOL_TO_ID;
  }
}

export const coinGeckoService = new CoinGeckoService();
