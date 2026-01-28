import { Router, Request, Response } from 'express';
import { weatherService } from '../services/weather/weather.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { weatherQuerySchema, forecastQuerySchema } from '../utils/validators';
import logger from '../utils/logger';

const router = Router();

router.get(
  '/current',
  asyncHandler(async (req: Request, res: Response) => {
    const { city } = weatherQuerySchema.parse(req.query);
    
    if (!weatherService.isSupported(city)) {
      throw new AppError(400, `Unsupported city: ${city}. Use /api/weather/cities for supported cities.`);
    }
    
    logger.info(`Fetching current weather for: ${city}`);
    const weather = await weatherService.getCurrentWeather(city);
    
    res.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/forecast',
  asyncHandler(async (req: Request, res: Response) => {
    const { city, hours } = forecastQuerySchema.parse(req.query);
    
    if (!weatherService.isSupported(city)) {
      throw new AppError(400, `Unsupported city: ${city}. Use /api/weather/cities for supported cities.`);
    }
    
    logger.info(`Fetching ${hours}h forecast for: ${city}`);
    const forecast = await weatherService.getForecast(city, hours);
    
    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/cities',
  asyncHandler(async (_req: Request, res: Response) => {
    const cities = weatherService.getSupportedCities();
    
    res.json({
      success: true,
      data: cities,
      count: cities.length,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
