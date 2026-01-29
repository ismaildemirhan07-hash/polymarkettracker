import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { PolymarketService } from '../services/polymarket/polymarket.service';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

const urlSchema = z.object({
  url: z.string().url('Invalid URL format')
});

const searchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters')
});

router.post(
  '/parse-url',
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = urlSchema.parse(req.body);

    logger.info(`Parsing Polymarket URL: ${url}`);

    const marketDetails = await PolymarketService.getMarketFromUrl(url);

    if (!marketDetails) {
      return res.status(404).json({
        success: false,
        error: 'Market not found or invalid URL',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: marketDetails,
      timestamp: new Date().toISOString()
    });
  })
);

router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = searchSchema.parse(req.query);

    logger.info(`Searching Polymarket markets: ${query}`);

    const markets = await PolymarketService.searchMarkets(query);

    res.json({
      success: true,
      data: markets,
      timestamp: new Date().toISOString()
    });
  })
);

router.get(
  '/market/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    logger.info(`Fetching Polymarket market: ${id}`);

    const market = await PolymarketService.getMarketById(id);

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: market,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;
