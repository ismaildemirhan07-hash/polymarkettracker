import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: Math.ceil(env.rateLimitWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Rate limit exceeded for this endpoint',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
