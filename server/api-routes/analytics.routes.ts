import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { rateLimitService } from '../services/rateLimit.service';
import { calculateDistance, calculatePnL, determineStatus } from '../utils/calculations';
import { cryptoService } from '../services/crypto/crypto.service';
import { weatherService } from '../services/weather/weather.service';
import { stocksService } from '../services/stocks/stocks.service';
import logger from '../utils/logger';

const router = Router();

router.get(
  '/portfolio',
  asyncHandler(async (_req: Request, res: Response) => {
    const bets = await prisma.bet.findMany({
      where: { resolved: false },
    });

    let totalInvested = 0;
    let currentValue = 0;
    let winningBets = 0;
    let losingBets = 0;

    for (const bet of bets) {
      totalInvested += bet.amount;

      try {
        const current = await getCurrentValueSafe(bet.type, bet.asset);
        if (current !== null) {
          const status = determineStatus(current, bet.threshold, bet.position as 'YES' | 'NO');
          if (status === 'winning') {
            winningBets++;
          } else {
            losingBets++;
          }

          const pnl = calculatePnL(bet.shares, bet.entryOdds, bet.amount);
          currentValue += pnl.currentValue;
        }
      } catch (error) {
        logger.warn(`Could not fetch current value for bet ${bet.id}: ${(error as Error).message}`);
      }
    }

    const unrealizedPnL = currentValue - totalInvested;
    const totalBets = bets.length;
    const winRate = totalBets > 0 ? (winningBets / totalBets) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalInvested,
        currentValue,
        unrealizedPnL,
        winningBets,
        losingBets,
        totalBets,
        winRate,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/performance',
  asyncHandler(async (_req: Request, res: Response) => {
    const resolvedBets = await prisma.bet.findMany({
      where: { resolved: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const won = resolvedBets.filter((b) => b.outcome === 'won');
    const lost = resolvedBets.filter((b) => b.outcome === 'lost');

    const totalWon = won.reduce((sum, b) => sum + b.shares, 0);
    const totalLost = lost.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      success: true,
      data: {
        totalResolved: resolvedBets.length,
        won: won.length,
        lost: lost.length,
        winRate: resolvedBets.length > 0 ? (won.length / resolvedBets.length) * 100 : 0,
        totalWon,
        totalLost,
        netProfit: totalWon - totalLost,
        recentBets: resolvedBets.slice(0, 10),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/api-usage',
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await rateLimitService.getUsageStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/by-type',
  asyncHandler(async (_req: Request, res: Response) => {
    const bets = await prisma.bet.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { amount: true },
    });

    const byType = bets.map((b) => ({
      type: b.type,
      count: b._count.id,
      totalInvested: b._sum.amount || 0,
    }));

    res.json({
      success: true,
      data: byType,
      timestamp: new Date().toISOString(),
    });
  })
);

async function getCurrentValueSafe(type: string, asset: string): Promise<number | null> {
  try {
    switch (type) {
      case 'crypto': {
        const price = await cryptoService.getPrice(asset);
        return price.price;
      }
      case 'stock': {
        const quote = await stocksService.getQuote(asset);
        return quote.price;
      }
      case 'weather': {
        const cityName = asset.replace(/_/g, ' ');
        const weather = await weatherService.getCurrentWeather(cityName);
        return weather.temperature;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default router;
