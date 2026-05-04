/**
 * Cache abstraction layer.
 * Uses node-cache under the hood, but the interface is Redis-compatible
 * so it can be swapped with ioredis with minimal changes.
 */
import NodeCache from "node-cache";

// stdTTL: default TTL in seconds, checkperiod: auto-delete expired keys every N seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

export const CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard:stats",
  DASHBOARD_TRENDS: "dashboard:trends",
  DASHBOARD_ACTIVITY: "dashboard:activity",
};

export const cacheService = {
  get: (key) => cache.get(key) ?? null,

  set: (key, value, ttl) => {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value); // uses stdTTL
  },

  del: (key) => cache.del(key),

  // Invalidate all dashboard-related keys at once (called on repair mutations)
  invalidateDashboard: () => {
    Object.values(CACHE_KEYS).forEach((key) => cache.del(key));
  },

  flush: () => cache.flushAll(),
};
