import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, AppError, NotFoundError } from '../middleware/errorHandler';
import { createBetSchema, updateBetSchema, paginationSchema } from '../utils/validators';
import { parseBetText } from '../utils/betMatcher';
import { calculateDistance, calculatePnL, determineStatus } from '../utils/calculations';
import { cryptoService } from '../services/crypto/crypto.service';
import { weatherService } from '../services/weather/weather.service';
import { stocksService } from '../services/stocks/stocks.service';
import logger from '../utils/logger';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [bets, total] = await Promise.all([
      prisma.bet.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, walletAddress: true } } },
      }),
      prisma.bet.count(),
    ]);

    res.json({
      success: true,
      data: bets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const bet = await prisma.bet.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, walletAddress: true } } },
    });

    if (!bet) {
      throw new NotFoundError(`Bet with ID ${id} not found`);
    }

    res.json({
      success: true,
      data: bet,
      timestamp: new Date().toISOString(),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const input = createBetSchema.parse(req.body);

    let parsedData = null;
    if (!input.type || !input.asset || !input.threshold) {
      parsedData = parseBetText(input.market);
      if (!parsedData) {
        throw new AppError(400, 'Could not parse bet market text. Please provide type, asset, and threshold manually.');
      }
    }

    const betData = {
      market: input.market,
      position: input.position,
      amount: input.amount,
      shares: input.shares,
      entryOdds: input.entryOdds,
      resolveDate: input.resolveDate,
      type: input.type || parsedData?.type || 'crypto',
      asset: input.asset || parsedData?.asset || '',
      threshold: input.threshold || parsedData?.threshold || 0,
      thresholdUnit: input.thresholdUnit || parsedData?.thresholdUnit || 'USD',
      category: input.category || getCategoryFromType(input.type || parsedData?.type || 'crypto'),
      dataSource: input.dataSource || getDataSourceFromType(input.type || parsedData?.type || 'crypto'),
    };

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'default@polymarket.com', tier: 'free' },
      });
    }

    const bet = await prisma.bet.create({
      data: {
        ...betData,
        userId: user.id,
      },
    });

    logger.info(`Created new bet: ${bet.id} - ${bet.market}`);

    res.status(201).json({
      success: true,
      data: bet,
      parsed: parsedData,
      timestamp: new Date().toISOString(),
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateBetSchema.parse(req.body);

    const existing = await prisma.bet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Bet with ID ${id} not found`);
    }

    const bet = await prisma.bet.update({
      where: { id },
      data: input,
    });

    logger.info(`Updated bet: ${bet.id}`);

    res.json({
      success: true,
      data: bet,
      timestamp: new Date().toISOString(),
    });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.bet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Bet with ID ${id} not found`);
    }

    await prisma.bet.delete({ where: { id } });

    logger.info(`Deleted bet: ${id}`);

    res.json({
      success: true,
      message: 'Bet deleted successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const bet = await prisma.bet.findUnique({ where: { id } });
    if (!bet) {
      throw new NotFoundError(`Bet with ID ${id} not found`);
    }

    let currentValue: number;
    try {
      currentValue = await getCurrentValue(bet.type, bet.asset);
    } catch (error) {
      throw new AppError(503, `Unable to fetch current value for ${bet.asset}`);
    }

    const distance = calculateDistance(currentValue, bet.threshold, bet.position as 'YES' | 'NO');
    const status = determineStatus(currentValue, bet.threshold, bet.position as 'YES' | 'NO');
    const pnl = calculatePnL(bet.shares, bet.entryOdds, bet.amount);

    res.json({
      success: true,
      data: {
        betId: bet.id,
        market: bet.market,
        position: bet.position,
        threshold: bet.threshold,
        thresholdUnit: bet.thresholdUnit,
        currentValue,
        distance: {
          value: distance.distanceValue,
          percent: distance.distancePercent,
        },
        status,
        isWinning: distance.isWinning,
        pnl: {
          invested: bet.amount,
          currentValue: pnl.currentValue,
          unrealizedPnL: pnl.unrealizedPnL,
          potentialPayout: pnl.potentialPayout,
          roi: pnl.roi,
        },
        resolveDate: bet.resolveDate,
        lastUpdate: new Date(),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

async function getCurrentValue(type: string, asset: string): Promise<number> {
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
      throw new Error(`Unsupported bet type: ${type}`);
  }
}

function getCategoryFromType(type: string): string {
  const categories: Record<string, string> = {
    crypto: 'Crypto',
    stock: 'Stocks',
    weather: 'Weather',
    sports: 'Sports',
  };
  return categories[type] || 'Other';
}

function getDataSourceFromType(type: string): string {
  const sources: Record<string, string> = {
    crypto: 'coingecko',
    stock: 'yahoo',
    weather: 'open-meteo',
    sports: 'api-sports',
  };
  return sources[type] || 'unknown';
}

export default router;
