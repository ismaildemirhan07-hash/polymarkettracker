import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  FRONTEND_URL: z.string().optional(),
  
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  FINNHUB_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  API_SPORTS_KEY: z.string().optional(),
  
  COINGECKO_DAILY_LIMIT: z.string().default('10000'),
  OPENMETEO_DAILY_LIMIT: z.string().default('10000'),
  FINNHUB_DAILY_LIMIT: z.string().default('60'),
  API_SPORTS_DAILY_LIMIT: z.string().default('100'),
  
  CRYPTO_CACHE_TTL: z.string().default('60'),
  WEATHER_CACHE_TTL: z.string().default('300'),
  STOCK_CACHE_TTL: z.string().default('60'),
  SPORTS_CACHE_TTL: z.string().default('15'),
  
  ENABLE_WEBSOCKET: z.string().default('true'),
  ENABLE_SPORTS: z.string().default('false'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parseInt(parsed.data.PORT, 10),
  frontendUrl: parsed.data.FRONTEND_URL,
  
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  
  finnhubApiKey: parsed.data.FINNHUB_API_KEY,
  openweatherApiKey: parsed.data.OPENWEATHER_API_KEY,
  apiSportsKey: parsed.data.API_SPORTS_KEY,
  
  rateLimits: {
    coingecko: parseInt(parsed.data.COINGECKO_DAILY_LIMIT, 10),
    openMeteo: parseInt(parsed.data.OPENMETEO_DAILY_LIMIT, 10),
    finnhub: parseInt(parsed.data.FINNHUB_DAILY_LIMIT, 10),
    apiSports: parseInt(parsed.data.API_SPORTS_DAILY_LIMIT, 10),
  },
  
  cacheTTL: {
    crypto: parseInt(parsed.data.CRYPTO_CACHE_TTL, 10),
    weather: parseInt(parsed.data.WEATHER_CACHE_TTL, 10),
    stock: parseInt(parsed.data.STOCK_CACHE_TTL, 10),
    sports: parseInt(parsed.data.SPORTS_CACHE_TTL, 10),
  },
  
  features: {
    websocket: parsed.data.ENABLE_WEBSOCKET === 'true',
    sports: parsed.data.ENABLE_SPORTS === 'true',
  },
  
  logLevel: parsed.data.LOG_LEVEL,
  
  corsOrigin: parsed.data.CORS_ORIGIN,
  rateLimitWindowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMaxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
  
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};
