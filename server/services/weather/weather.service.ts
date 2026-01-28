import { WeatherData } from '../../types';
import { cacheService } from '../../config/redis';
import { env } from '../../config/env';
import { openMeteoService } from './openMeteo.service';
import { openWeatherService } from './openWeather.service';
import logger from '../../utils/logger';

export class WeatherService {
  private cacheTTL: number;
  private forecastCacheTTL: number;

  constructor() {
    this.cacheTTL = env.cacheTTL.weather;
    this.forecastCacheTTL = this.cacheTTL * 6;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    const normalizedCity = city.toUpperCase().replace(/\s+/g, '_');
    const cacheKey = `weather:current:${normalizedCity}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<WeatherData>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching weather for ${city} from Open-Meteo`);
            return await openMeteoService.getCurrentWeather(city);
          } catch (error) {
            logger.warn(`Open-Meteo failed for ${city}, trying OpenWeather: ${(error as Error).message}`);
            if (openWeatherService.isConfigured()) {
              return await openWeatherService.getCurrentWeather(city);
            }
            throw error;
          }
        },
        this.cacheTTL
      );

      if (cached) {
        logger.debug(`Cache hit for ${city} weather`);
      }

      return data;
    } catch (error) {
      logger.error(`All weather APIs failed for ${city}: ${(error as Error).message}`);

      const cached = await cacheService.get<WeatherData>(cacheKey);
      if (cached) {
        return {
          ...cached,
          stale: true,
          warning: 'Using cached data - live APIs unavailable',
        };
      }

      throw new Error(`Unable to fetch weather for ${city}`);
    }
  }

  async getForecast(city: string, hours: number = 24): Promise<WeatherData> {
    const normalizedCity = city.toUpperCase().replace(/\s+/g, '_');
    const cacheKey = `weather:forecast:${normalizedCity}:${hours}`;

    try {
      const { data, cached } = await cacheService.getOrFetch<WeatherData>(
        cacheKey,
        async () => {
          try {
            logger.info(`Fetching ${hours}h forecast for ${city} from Open-Meteo`);
            return await openMeteoService.getForecast(city, hours);
          } catch (error) {
            logger.warn(`Open-Meteo forecast failed, trying OpenWeather: ${(error as Error).message}`);
            if (openWeatherService.isConfigured()) {
              return await openWeatherService.getForecast(city, hours);
            }
            throw error;
          }
        },
        this.forecastCacheTTL
      );

      if (cached) {
        logger.debug(`Cache hit for ${city} forecast`);
      }

      return data;
    } catch (error) {
      logger.error(`All weather APIs failed for ${city} forecast: ${(error as Error).message}`);
      throw new Error(`Unable to fetch forecast for ${city}`);
    }
  }

  getSupportedCities(): string[] {
    return openMeteoService.getSupportedCities();
  }

  isSupported(city: string): boolean {
    return openMeteoService.isSupported(city);
  }
}

export const weatherService = new WeatherService();
