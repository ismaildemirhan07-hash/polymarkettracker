import axios from 'axios';
import { prisma } from '../../config/database';
import { cacheService } from '../../config/redis';
import logger from '../../utils/logger';
import { CryptoPriceService } from '../crypto/crypto-price.service';

const DATA_API_BASE = 'https://data-api.polymarket.com';

interface PolymarketPosition {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  percentRealizedPnl: number;
  curPrice: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon?: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string;
  negativeRisk: boolean;
}

export class WalletSyncService {
  /**
   * Extract start time from Bitcoin Up/Down bet title
   * Example: "Bitcoin Up or Down - January 29, 5:15PM-5:30PM ET" -> Date for 5:15PM on Jan 29
   */
  private static parseStartTimeFromTitle(title: string): Date | null {
    try {
      // Match pattern like "January 29, 5:15PM-5:30PM ET"
      const match = title.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{1,2}):(\d{2})(AM|PM)/i);
      if (!match) return null;

      const [, month, day, hour, minute, ampm] = match;
      const year = new Date().getFullYear();
      
      // Convert month name to number
      const monthNum = new Date(Date.parse(month + " 1, 2000")).getMonth();
      
      // Convert to 24-hour format
      let hour24 = parseInt(hour);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
      
      const date = new Date(year, monthNum, parseInt(day), hour24, parseInt(minute));
      return date;
    } catch (error) {
      logger.error('Error parsing start time from title:', error);
      return null;
    }
  }

  /**
   * Get threshold (starting price) for Bitcoin Up/Down bets
   */
  private static async getThresholdForBet(title: string): Promise<number> {
    // Check if it's a Bitcoin Up/Down bet
    if (!title.toLowerCase().includes('bitcoin') || !title.toLowerCase().includes('up or down')) {
      return 0; // Not a time-based Bitcoin bet
    }

    // For now, use current BTC price as approximation
    // In production, you'd want to fetch historical price at the exact start time
    try {
      const currentPrice = await CryptoPriceService.getPrice('BTC');
      return currentPrice || 0;
    } catch (error) {
      logger.error('Error fetching BTC price for threshold:', error);
      return 0;
    }
  }
  private static CACHE_TTL = 300; // 5 minutes

  /**
   * Fetch user positions from Polymarket Data API
   */
  static async fetchUserPositions(walletAddress: string): Promise<PolymarketPosition[]> {
    try {
      const cacheKey = `polymarket:positions:${walletAddress}`;
      const cached = await cacheService.get<PolymarketPosition[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${DATA_API_BASE}/positions`, {
        params: {
          user: walletAddress,
          limit: 100
        }
      });

      const positions = response.data || [];
      await cacheService.set(cacheKey, positions, this.CACHE_TTL);
      
      return positions;
    } catch (error) {
      logger.error('Error fetching Polymarket positions:', error);
      return [];
    }
  }

  /**
   * Sync wallet positions to database
   */
  static async syncWalletToDatabase(userId: string, walletAddress: string): Promise<number> {
    try {
      const positions = await this.fetchUserPositions(walletAddress);
      
      if (positions.length === 0) {
        return 0;
      }

      let syncedCount = 0;

      for (const position of positions) {
        // Log position data for debugging
        logger.info(`Processing position: ${position.title}, curPrice: ${position.curPrice}, avgPrice: ${position.avgPrice}, cashPnl: ${position.cashPnl}`);
        
        // Check if bet already exists
        const existingBet = await prisma.bet.findFirst({
          where: {
            userId,
            polymarketConditionId: position.conditionId
          }
        });

        if (existingBet) {
          // Update existing bet - also update threshold if it's 0 (for Bitcoin Up/Down bets)
          const updateData: any = {
            currentValue: position.curPrice || position.avgPrice,
            pnl: position.cashPnl || 0,
            status: this.determineStatus(position.endDate),
            updatedAt: new Date()
          };
          
          // If threshold is 0 and it's a Bitcoin Up/Down bet, set it now
          if (existingBet.threshold === 0) {
            const threshold = await this.getThresholdForBet(position.title);
            if (threshold > 0) {
              updateData.threshold = threshold;
              updateData.thresholdUnit = 'USD';
            }
          }
          
          await prisma.bet.update({
            where: { id: existingBet.id },
            data: updateData
          });
        } else {
          // Create new bet
          // Get threshold for Bitcoin Up/Down bets
          const threshold = await this.getThresholdForBet(position.title);
          
          await prisma.bet.create({
            data: {
              userId,
              market: position.title,
              type: 'crypto', // Default type for Polymarket
              position: position.outcome.toUpperCase(),
              amount: position.initialValue || 0,
              shares: position.size || 0,
              entryOdds: position.avgPrice || 0,
              currentValue: position.curPrice || position.avgPrice || 0, // Fallback chain
              pnl: position.cashPnl || 0,
              resolveDate: new Date(position.endDate),
              status: this.determineStatus(position.endDate),
              category: 'Polymarket',
              threshold: threshold, // Starting BTC price for Up/Down bets
              thresholdUnit: threshold > 0 ? 'USD' : 'outcome',
              dataSource: 'Polymarket',
              asset: position.title,
              polymarketConditionId: position.conditionId,
              polymarketSlug: position.slug,
              polymarketEventSlug: position.eventSlug
            }
          });
          syncedCount++;
        }
      }

      logger.info(`Synced ${syncedCount} new positions for user ${userId}`);
      return syncedCount;
    } catch (error) {
      logger.error('Error syncing wallet to database:', error);
      throw new Error('Failed to sync wallet positions');
    }
  }

  /**
   * Determine bet status based on end date
   */
  private static determineStatus(endDate: string): string {
    const now = new Date();
    const resolveDate = new Date(endDate);
    
    if (resolveDate > now) {
      return 'ACTIVE';
    } else {
      return 'PENDING_RESOLUTION';
    }
  }

  /**
   * Get user's portfolio value from Polymarket
   */
  static async getPortfolioValue(walletAddress: string): Promise<number> {
    try {
      const response = await axios.get(`${DATA_API_BASE}/value`, {
        params: {
          user: walletAddress
        }
      });

      const data = response.data;
      if (data && data.length > 0) {
        return data[0].value || 0;
      }

      return 0;
    } catch (error) {
      logger.error('Error fetching portfolio value:', error);
      return 0;
    }
  }
}
