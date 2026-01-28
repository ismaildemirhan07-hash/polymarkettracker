import { Router, Request, Response } from 'express';
import { stocksService } from '../services/stocks/stocks.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { stockQuerySchema, singleSymbolSchema, historyQuerySchema } from '../utils/validators';
import logger from '../utils/logger';

const router = Router();

router.get(
  '/quote',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = stockQuerySchema.parse(req.query);
    
    logger.info(`Fetching stock quotes for: ${symbols.join(', ')}`);
    const quotes = await stocksService.getQuotes(symbols);
    
    res.json({
      success: true,
      data: quotes,
      count: quotes.length,
      marketStatus: stocksService.getMarketStatus(),
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/quote/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = singleSymbolSchema.parse(req.params);
    
    logger.info(`Fetching stock quote for: ${symbol}`);
    const quote = await stocksService.getQuote(symbol);
    
    res.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/history/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = singleSymbolSchema.parse(req.params);
    const { days } = historyQuerySchema.parse(req.query);
    
    logger.info(`Fetching ${days}-day history for: ${symbol}`);
    const history = await stocksService.getHistory(symbol, days);
    
    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/market-status',
  asyncHandler(async (_req: Request, res: Response) => {
    const status = stocksService.getMarketStatus();
    
    res.json({
      success: true,
      data: {
        status,
        isOpen: status === 'open',
        message: getMarketStatusMessage(status),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

function getMarketStatusMessage(status: string): string {
  switch (status) {
    case 'open':
      return 'US markets are currently open (9:30 AM - 4:00 PM ET)';
    case 'pre-market':
      return 'Pre-market trading session (4:00 AM - 9:30 AM ET)';
    case 'after-hours':
      return 'After-hours trading session (4:00 PM - 8:00 PM ET)';
    case 'closed':
      return 'US markets are closed';
    default:
      return 'Market status unknown';
  }
}

export default router;
