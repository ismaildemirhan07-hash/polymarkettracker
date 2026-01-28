import { z } from 'zod';

export const createBetSchema = z.object({
  market: z.string().min(1, 'Market description is required'),
  position: z.enum(['YES', 'NO']),
  amount: z.number().positive('Amount must be positive'),
  shares: z.number().int().positive('Shares must be a positive integer'),
  entryOdds: z.number().min(0).max(1, 'Entry odds must be between 0 and 1'),
  resolveDate: z.string().or(z.date()).transform((val) => new Date(val)),
  type: z.enum(['crypto', 'stock', 'weather', 'sports']).optional(),
  asset: z.string().optional(),
  threshold: z.number().optional(),
  thresholdUnit: z.string().optional(),
  category: z.string().optional(),
  dataSource: z.string().optional(),
});

export const updateBetSchema = z.object({
  market: z.string().min(1).optional(),
  position: z.enum(['YES', 'NO']).optional(),
  amount: z.number().positive().optional(),
  shares: z.number().int().positive().optional(),
  entryOdds: z.number().min(0).max(1).optional(),
  resolveDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  resolved: z.boolean().optional(),
  outcome: z.enum(['won', 'lost', 'pending']).optional(),
});

export const cryptoQuerySchema = z.object({
  symbols: z.string().transform((val) => val.split(',').map((s) => s.trim().toUpperCase())),
});

export const singleSymbolSchema = z.object({
  symbol: z.string().min(1).max(10).transform((val) => val.toUpperCase()),
});

export const historyQuerySchema = z.object({
  days: z.string().optional().default('7').transform((val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 7 : Math.min(Math.max(num, 1), 365);
  }),
});

export const weatherQuerySchema = z.object({
  city: z.string().min(1, 'City is required'),
});

export const forecastQuerySchema = z.object({
  city: z.string().min(1, 'City is required'),
  hours: z.string().optional().default('24').transform((val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 24 : Math.min(Math.max(num, 1), 168);
  }),
});

export const stockQuerySchema = z.object({
  symbols: z.string().transform((val) => val.split(',').map((s) => s.trim().toUpperCase())),
});

export const sportsQuerySchema = z.object({
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL']),
});

export const scheduleQuerySchema = z.object({
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL']),
  date: z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type CreateBetInput = z.infer<typeof createBetSchema>;
export type UpdateBetInput = z.infer<typeof updateBetSchema>;
export type CryptoQuery = z.infer<typeof cryptoQuerySchema>;
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
export type ForecastQuery = z.infer<typeof forecastQuerySchema>;
export type StockQuery = z.infer<typeof stockQuerySchema>;
