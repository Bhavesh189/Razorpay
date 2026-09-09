import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SESSION_TTL = parseInt(process.env.SESSION_TTL_SECONDS, 10) || 86400; // 24 hours

// High-Performance In-Memory Fallback Store for standalone development or when Redis is offline
class FallbackRedisStore {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();

    // Automatic TTL eviction timer
    setInterval(() => this.sweepExpired(), 60000);
  }

  sweepExpired() {
    const now = Date.now();
    for (const [key, expiresAt] of this.ttls.entries()) {
      if (now > expiresAt) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }

  async get(key) {
    const expiresAt = this.ttls.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    const val = this.store.get(key);
    return val !== undefined ? val : null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (mode === 'EX' && typeof duration === 'number') {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.ttls.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }
}

class DistributedSessionService {
  constructor() {
    this.client = null;
    this.isRedisReady = false;
    this.fallbackStore = new FallbackRedisStore();
    this.initClient();
  }

  initClient() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          retryStrategy: () => null // don't loop infinitely if offline
        });

        this.client.connect().then(() => {
          this.isRedisReady = true;
          console.log('✅ [Redis] Connected to Redis cluster at', redisUrl);
        }).catch(() => {
          this.isRedisReady = false;
          console.log('ℹ️ [Redis] Standalone Redis not reachable. Using high-performance in-memory TTL session store.');
        });

        this.client.on('error', () => {
          this.isRedisReady = false;
        });
      } catch (e) {
        this.isRedisReady = false;
      }
    } else {
      console.log('ℹ️ [Redis] REDIS_URL not configured. Running with in-memory TTL distributed session store.');
    }
  }

  async get(key) {
    if (this.isRedisReady && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fall back gracefully
      }
    }
    return await this.fallbackStore.get(key);
  }

  async set(key, value, ttlSeconds = DEFAULT_SESSION_TTL) {
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
    if (this.isRedisReady && this.client) {
      try {
        return await this.client.set(key, strVal, 'EX', ttlSeconds);
      } catch {
        // Fall back gracefully
      }
    }
    return await this.fallbackStore.set(key, strVal, 'EX', ttlSeconds);
  }

  async del(key) {
    if (this.isRedisReady && this.client) {
      try {
        return await this.client.del(key);
      } catch {}
    }
    return await this.fallbackStore.del(key);
  }

  // ==================== EPHEMERAL AI SHOPPING SESSION STATE ====================
  // Structure strictly follows Section 5 requirement:
  // { sessionId, conversation, currentIntent, category, requirements, activeResults, cart, checkoutState, updatedAt }
  async getSessionState(sessionId) {
    const key = `session:${sessionId}`;
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async setSessionState(sessionId, state, ttlSeconds = DEFAULT_SESSION_TTL) {
    const key = `session:${sessionId}`;
    const cleanSessionData = {
      sessionId: state.sessionId || sessionId,
      conversation: state.conversation || state.searchHistory || [],
      currentIntent: state.currentIntent || state.state || "GREETING",
      category: state.category || null,
      requirements: state.requirements || {},
      activeResults: state.activeResults || state.activeResultSet || [],
      cart: state.cart || state.cartContext || [],
      checkoutState: state.checkoutState || state.inChatCheckout || null,
      updatedAt: new Date().toISOString()
    };
    await this.set(key, JSON.stringify(cleanSessionData), ttlSeconds);
    return cleanSessionData;
  }

  async clearSessionState(sessionId) {
    const key = `session:${sessionId}`;
    await this.del(key);
  }

  async deleteSessionState(sessionId) {
    return this.clearSessionState(sessionId);
  }

  // ==================== EPHEMERAL CART STATE ====================
  async getCart(sessionId) {
    const key = `cart:${sessionId}`;
    const raw = await this.get(key);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async setCart(sessionId, cartItems, ttlSeconds = DEFAULT_SESSION_TTL * 7) {
    const key = `cart:${sessionId}`;
    await this.set(key, JSON.stringify(cartItems), ttlSeconds);
  }

  async clearCart(sessionId) {
    const key = `cart:${sessionId}`;
    await this.del(key);
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }
}

export const redisService = new DistributedSessionService();
