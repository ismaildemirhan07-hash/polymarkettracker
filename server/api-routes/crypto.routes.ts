import { Router, Request, Response } from 'express';
import { cryptoService } from '../services/crypto/crypto.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { cryptoQuerySchema, singleSymbolSchema, historyQuerySchema } from '../utils/validators';
import logger from '../utils/logger';

const router = Router();

router.get(
  '/prices',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = cryptoQuerySchema.parse(req.query);
    
    logger.info(`Fetching crypto prices for: ${symbols.join(', ')}`);
    const prices = await cryptoService.getPrices(symbols);
    
    res.json({
      success: true,
      data: prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/price/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = singleSymbolSchema.parse(req.params);
    
    if (!cryptoService.isSupported(symbol)) {
      throw new AppError(400, `Unsupported crypto symbol: ${symbol}`);
    }
    
    logger.info(`Fetching crypto price for: ${symbol}`);
    const price = await cryptoService.getPrice(symbol);
    
    res.json({
      success: true,
      data: price,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/history/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = singleSymbolSchema.parse(req.params);
    const { days } = historyQuerySchema.parse(req.query);
    
    if (!cryptoService.isSupported(symbol)) {
      throw new AppError(400, `Unsupported crypto symbol: ${symbol}`);
    }
    
    logger.info(`Fetching ${days}-day history for: ${symbol}`);
    const history = await cryptoService.getHistory(symbol, days);
    
    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  })
);

router.post(
  '/bulk-prices',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.body as { symbols: string[] };
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new AppError(400, 'symbols array is required');
    }
    
    if (symbols.length > 20) {
      throw new AppError(400, 'Maximum 20 symbols allowed per request');
    }
    
    const normalizedSymbols = symbols.map((s) => s.toUpperCase());
    logger.info(`Bulk fetching crypto prices for: ${normalizedSymbols.join(', ')}`);
    
    const prices = await cryptoService.getPrices(normalizedSymbols);
    
    res.json({
      success: true,
      data: prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/supported',
  asyncHandler(async (_req: Request, res: Response) => {
    const symbols = cryptoService.getSupportedSymbols();
    
    res.json({
      success: true,
      data: symbols,
      count: symbols.length,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
