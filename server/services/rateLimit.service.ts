import { prisma } from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';

interface RateLimitConfig {
  service: string;
  endpoint: string;
  dailyLimit: number;
}

const RATE_LIMITS: RateLimitConfig[] = [
  { service: 'coingecko', endpoint: 'prices', dailyLimit: env.rateLimits.coingecko },
  { service: 'binance', endpoint: 'prices', dailyLimit: 100000 },
  { service: 'open-meteo', endpoint: 'forecast', dailyLimit: env.rateLimits.openMeteo },
  { service: 'openweather', endpoint: 'weather', dailyLimit: 1000 },
  { service: 'yahoo', endpoint: 'quote', dailyLimit: 2000 },
  { service: 'finnhub', endpoint: 'quote', dailyLimit: env.rateLimits.finnhub },
  { service: 'api-sports', endpoint: 'games', dailyLimit: env.rateLimits.apiSports },
];

export class RateLimitService {
  async checkLimit(service: string, endpoint: string): Promise<boolean> {
    const config = RATE_LIMITS.find(
      (r) => r.service === service && r.endpoint === endpoint
    );
    
    if (!config) {
      logger.warn(`No rate limit config for ${service}/${endpoint}`);
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      let usage = await prisma.apiUsage.findUnique({
        where: { service_endpoint: { service, endpoint } },
      });

      if (!usage || usage.lastReset < today) {
        usage = await prisma.apiUsage.upsert({
          where: { service_endpoint: { service, endpoint } },
          create: { service, endpoint, callsToday: 0, lastReset: today },
          update: { callsToday: 0, lastReset: today },
        });
      }

      if (usage.callsToday >= config.dailyLimit) {
        logger.warn(`Rate limit reached for ${service}/${endpoint}: ${usage.callsToday}/${config.dailyLimit}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error checking rate limit: ${(error as Error).message}`);
      return true;
    }
  }

  async incrementUsage(service: string, endpoint: string): Promise<void> {
    try {
      await prisma.apiUsage.updateMany({
        where: { service, endpoint },
        data: { callsToday: { increment: 1 } },
      });
    } catch (error) {
      logger.error(`Error incrementing usage: ${(error as Error).message}`);
    }
  }

  async getUsageStats(): Promise<Array<{
    service: string;
    endpoint: string;
    callsToday: number;
    dailyLimit: number;
    percentUsed: number;
    lastReset: Date;
  }>> {
    try {
      const usages = await prisma.apiUsage.findMany();
      
      return usages.map((usage) => {
        const config = RATE_LIMITS.find(
          (r) => r.service === usage.service && r.endpoint === usage.endpoint
        );
        const dailyLimit = config?.dailyLimit || 0;
        
        return {
          service: usage.service,
          endpoint: usage.endpoint,
          callsToday: usage.callsToday,
          dailyLimit,
          percentUsed: dailyLimit > 0 ? (usage.callsToday / dailyLimit) * 100 : 0,
          lastReset: usage.lastReset,
        };
      });
    } catch (error) {
      logger.error(`Error getting usage stats: ${(error as Error).message}`);
      return [];
    }
  }

  async resetAllCounters(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await prisma.apiUsage.updateMany({
        data: { callsToday: 0, lastReset: today },
      });
      logger.info('All API usage counters reset');
    } catch (error) {
      logger.error(`Error resetting counters: ${(error as Error).message}`);
    }
  }
}

export const rateLimitService = new RateLimitService();
