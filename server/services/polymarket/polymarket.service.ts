import axios from 'axios';
import { cache } from '../../config/redis';
import logger from '../../utils/logger';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

interface PolymarketMarket {
  id: string;
  question: string;
  end_date_iso: string;
  outcomes: string[];
  tokens: Array<{
    token_id: string;
    outcome: string;
    price: number;
  }>;
}

interface MarketDetails {
  marketId: string;
  question: string;
  endDate: string;
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
}

export class PolymarketService {
  private static CACHE_TTL = 60; // 1 minute

  /**
   * Extract market ID from Polymarket URL
   * Examples:
   * - https://polymarket.com/event/will-bitcoin-hit-110000-before-feb-1
   * - https://polymarket.com/market/bitcoin-price-prediction
   */
  static extractMarketIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Extract slug from URL (last part)
      if (pathParts.length >= 2) {
        return pathParts[pathParts.length - 1];
      }
      
      return null;
    } catch (error) {
      logger.error('Invalid Polymarket URL:', error);
      return null;
    }
  }

  /**
   * Search for markets by question text
   */
  static async searchMarkets(query: string): Promise<PolymarketMarket[]> {
    try {
      const cacheKey = `polymarket:search:${query}`;
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await axios.get(`${GAMMA_API_BASE}/markets`, {
        params: {
          limit: 20,
          offset: 0,
          _search: query
        }
      });

      const markets = response.data || [];
      await cache.set(cacheKey, JSON.stringify(markets), this.CACHE_TTL);
      
      return markets;
    } catch (error) {
      logger.error('Error searching Polymarket markets:', error);
      throw new Error('Failed to search Polymarket markets');
    }
  }

  /**
   * Get market details by condition ID
   */
  static async getMarketById(conditionId: string): Promise<MarketDetails | null> {
    try {
      const cacheKey = `polymarket:market:${conditionId}`;
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await axios.get(`${GAMMA_API_BASE}/markets/${conditionId}`);
      const market = response.data;

      if (!market) {
        return null;
      }

      // Get current prices from CLOB
      const prices = await this.getMarketPrices(market.tokens);

      const marketDetails: MarketDetails = {
        marketId: market.condition_id,
        question: market.question,
        endDate: market.end_date_iso,
        outcomes: market.outcomes,
        yesPrice: prices.yes,
        noPrice: prices.no
      };

      await cache.set(cacheKey, JSON.stringify(marketDetails), this.CACHE_TTL);
      
      return marketDetails;
    } catch (error) {
      logger.error('Error fetching Polymarket market:', error);
      return null;
    }
  }

  /**
   * Get current market prices
   */
  private static async getMarketPrices(tokens: any[]): Promise<{ yes: number; no: number }> {
    try {
      if (!tokens || tokens.length < 2) {
        return { yes: 0.5, no: 0.5 };
      }

      // Get YES token price
      const yesToken = tokens.find(t => t.outcome === 'Yes' || t.outcome === 'YES');
      const noToken = tokens.find(t => t.outcome === 'No' || t.outcome === 'NO');

      if (!yesToken || !noToken) {
        return { yes: 0.5, no: 0.5 };
      }

      // Fetch live prices from CLOB
      const yesPrice = await this.getTokenPrice(yesToken.token_id);
      const noPrice = await this.getTokenPrice(noToken.token_id);

      return {
        yes: yesPrice,
        no: noPrice
      };
    } catch (error) {
      logger.error('Error fetching market prices:', error);
      return { yes: 0.5, no: 0.5 };
    }
  }

  /**
   * Get token price from CLOB
   */
  private static async getTokenPrice(tokenId: string): Promise<number> {
    try {
      const response = await axios.get(`${CLOB_API_BASE}/midpoint`, {
        params: { token_id: tokenId }
      });

      const midpoint = response.data?.mid;
      return midpoint ? parseFloat(midpoint) : 0.5;
    } catch (error) {
      logger.error(`Error fetching token price for ${tokenId}:`, error);
      return 0.5;
    }
  }

  /**
   * Get market details from URL
   */
  static async getMarketFromUrl(url: string): Promise<MarketDetails | null> {
    const marketId = this.extractMarketIdFromUrl(url);
    
    if (!marketId) {
      throw new Error('Invalid Polymarket URL');
    }

    // Try to find market by searching
    const markets = await this.searchMarkets(marketId);
    
    if (markets.length > 0) {
      return await this.getMarketById(markets[0].id);
    }

    return null;
  }
}
