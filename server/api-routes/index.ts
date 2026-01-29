import { Router } from 'express';
import cryptoRoutes from './crypto.routes';
import weatherRoutes from './weather.routes';
import stocksRoutes from './stocks.routes';
import betsRoutes from './bets.routes';
import analyticsRoutes from './analytics.routes';
import polymarketRoutes from './polymarket.routes';

const router = Router();

router.use('/crypto', cryptoRoutes);
router.use('/weather', weatherRoutes);
router.use('/stocks', stocksRoutes);
router.use('/bets', betsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/polymarket', polymarketRoutes);

export default router;
