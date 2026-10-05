import Redis from 'ioredis';
import { ENV } from '../config/env.js';

let redisInstance = null;
let isConnected = false;

export function getRedisConfig() {
  if (ENV.REDIS_URL && ENV.REDIS_URL.trim()) {
    return ENV.REDIS_URL;
  }
  return {
    host: ENV.REDIS_HOST || '127.0.0.1',
    port: ENV.REDIS_PORT || 6379,
    password: ENV.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 5) {
        return null; // Stop reconnecting after 5 attempts to allow seamless fallback
      }
      return Math.min(times * 300, 2000);
    }
  };
}

export function createRedisClient() {
  const config = getRedisConfig();
  const client = typeof config === 'string' ? new Redis(config) : new Redis(config);

  client.on('connect', () => {
    isConnected = true;
    console.log('⚡ [Redis] Connected successfully for BullMQ background workers');
  });

  client.on('error', (err) => {
    isConnected = false;
    // Suppress spammy offline logs; queue manager handles fallback
  });

  return client;
}

export async function testRedisConnection() {
  try {
    const config = getRedisConfig();
    const testClient = typeof config === 'string' 
      ? new Redis(config, { maxRetriesPerRequest: 1, connectTimeout: 1500 }) 
      : new Redis({ ...config, maxRetriesPerRequest: 1, connectTimeout: 1500 });

    const pong = await testClient.ping();
    if (pong !== 'PONG') {
      testClient.disconnect();
      return { ok: false, reason: 'PING failed' };
    }

    // BullMQ strictly requires Redis >= 5.0.0 (uses Redis Streams XADD/XREAD)
    const info = await testClient.info('server');
    const versionMatch = info.match(/redis_version:([0-9.]+)/);
    const version = versionMatch ? versionMatch[1] : '0.0.0';
    const majorVersion = parseInt(version.split('.')[0], 10);
    testClient.disconnect();

    if (majorVersion < 5) {
      console.log(`ℹ️ [Redis] Detected Redis v${version}. BullMQ requires Redis >= 5.0 for streams. Activating Decoupled Asynchronous Worker Queue.`);
      return { ok: false, version, reason: 'Redis version < 5.0.0' };
    }

    return { ok: true, version };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export function getRedisStatus() {
  return isConnected;
}
