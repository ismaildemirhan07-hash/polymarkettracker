import axios from 'axios';
import { cacheService } from '../../config/redis';
import { logger } from '../../utils/logger';

const BINANCE_API = 'https://api.binance.com/api/v3';
const CACHE_TTL = 30; // 30 seconds for crypto prices

interface CryptoPrice {
  symbol: string;
  price: number;
  lastUpdated: Date;
}

export class CryptoPriceService {
  /**
   * Get cryptocurrency price from Binance
   */
  static async getPrice(symbol: string): Promise<number | null> {
    try {
      const cacheKey = `crypto:price:${symbol.toUpperCase()}`;
      const cached = await cacheService.get<number>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Map common names to trading pairs
      const symbolMap: Record<string, string> = {
        'BITCOIN': 'BTCUSDT',
        'BTC': 'BTCUSDT',
        'ETHEREUM': 'ETHUSDT',
        'ETH': 'ETHUSDT',
        'SOL': 'SOLUSDT',
        'SOLANA': 'SOLUSDT',
        'XRP': 'XRPUSDT',
        'RIPPLE': 'XRPUSDT',
        'ADA': 'ADAUSDT',
        'CARDANO': 'ADAUSDT',
        'DOGE': 'DOGEUSDT',
        'DOGECOIN': 'DOGEUSDT',
        'DOT': 'DOTUSDT',
        'POLKADOT': 'DOTUSDT',
        'MATIC': 'MATICUSDT',
        'POLYGON': 'MATICUSDT',
        'LINK': 'LINKUSDT',
        'CHAINLINK': 'LINKUSDT',
        'LTC': 'LTCUSDT',
        'LITECOIN': 'LTCUSDT'
      };

      const tradingPair = symbolMap[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;

      const response = await axios.get(`${BINANCE_API}/ticker/price`, {
        params: { symbol: tradingPair },
        timeout: 5000
      });

      const price = parseFloat(response.data.price);
      await cacheService.set(cacheKey, price, CACHE_TTL);
      
      return price;
    } catch (error) {
      logger.error(`Error fetching ${symbol} price:`, error);
      return null;
    }
  }

  /**
   * Extract crypto symbol from market title
   */
  static extractCryptoFromTitle(title: string): string | null {
    const cryptoKeywords = ['Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Solana', 'SOL'];
    
    for (const keyword of cryptoKeywords) {
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        return keyword;
      }
    }
    
    return null;
  }

  /**
   * Get multiple crypto prices
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
