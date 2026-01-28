import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error.message);
    });

    redis.on('close', () => {
      console.log('📤 Redis connection closed');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  try {
    await client.connect();
  } catch (error) {
    // Connection might already be established
    if ((error as Error).message !== 'Redis is already connecting/connected') {
      console.warn('⚠️ Redis connection warning:', (error as Error).message);
    }
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// Fallback in-memory cache for when Redis is unavailable
const memoryCache = new Map<string, { value: string; expiry: number }>();

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      // Fallback to memory cache
      memoryCache.set(key, {
        value: JSON.stringify(value),
        expiry: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.value);
      }
      memoryCache.delete(key);
      return null;
    }
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<{ data: T; cached: boolean }> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return { data: cached, cached: true };
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return { data: fresh, cached: false };
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      memoryCache.delete(key);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      // Clear matching keys from memory cache
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          memoryCache.delete(key);
        }
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) === 1;
    } catch (error) {
      const cached = memoryCache.get(key);
      return cached !== undefined && cached.expiry > Date.now();
    }
  }
}

export const cacheService = new CacheService();
