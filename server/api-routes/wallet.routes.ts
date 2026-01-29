import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { WalletSyncService } from '../services/polymarket/wallet-sync.service';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

const walletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
});

/**
 * Sync user's Polymarket wallet positions
 */
router.post(
  '/sync',
  asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = walletSchema.parse(req.body);
    const userId = req.body.userId || 'demo-user'; // TODO: Get from auth

    logger.info(`Syncing wallet ${walletAddress} for user ${userId}`);

    const syncedCount = await WalletSyncService.syncWalletToDatabase(userId, walletAddress);

    res.json({
      success: true,
      data: {
        syncedPositions: syncedCount,
        walletAddress
      },
      message: `Successfully synced ${syncedCount} positions`,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * Get user's positions from Polymarket
 */
router.get(
  '/positions/:walletAddress',
  asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Fetching positions for wallet ${walletAddress}`);

    const positions = await WalletSyncService.fetchUserPositions(walletAddress);

    res.json({
      success: true,
      data: {
        positions,
        count: positions.length
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * Get portfolio value
 */
router.get(
  '/value/:walletAddress',
  asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
        timestamp: new Date().toISOString()
      });
    }

    const value = await WalletSyncService.getPortfolioValue(walletAddress);

    res.json({
      success: true,
      data: {
        walletAddress,
        totalValue: value
      },
      timestamp: new Date().toISOString()
    });
  })
);

export default router;
