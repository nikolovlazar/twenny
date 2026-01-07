import Redis from "ioredis";
import * as Sentry from "@sentry/nextjs";

// Create Redis connection for caching
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
});

const CACHE_PREFIX = "cache:";

export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
}

/**
 * Get a value from cache with Sentry instrumentation
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const cacheKey = `${CACHE_PREFIX}${key}`;

  return Sentry.startSpan(
    {
      name: cacheKey,
      op: "cache.get",
      attributes: {
        "cache.key": [cacheKey],
        "network.peer.address": process.env.REDIS_URL,
      },
    },
    async (span) => {
      const value = await redis.get(cacheKey);
      const cacheHit = value !== null;

      span.setAttribute("cache.hit", cacheHit);

      if (cacheHit) {
        span.setAttribute("cache.item_size", value.length);
        return JSON.parse(value) as T;
      }

      return null;
    }
  );
}

/**
 * Set a value in cache with Sentry instrumentation
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const serialized = JSON.stringify(value);
  const { ttl = 30 } = options; // Default 30 seconds TTL

  return Sentry.startSpan(
    {
      name: cacheKey,
      op: "cache.put",
      attributes: {
        "cache.key": [cacheKey],
        "cache.item_size": serialized.length,
        "network.peer.address": process.env.REDIS_URL,
      },
    },
    async () => {
      await redis.setex(cacheKey, ttl, serialized);
    }
  );
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  await redis.del(cacheKey);
}

/**
 * Delete all cache keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
