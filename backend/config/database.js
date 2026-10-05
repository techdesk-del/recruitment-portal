import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Only configure custom DNS in non-serverless local environments when necessary
if (!isServerless) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore if DNS server override is restricted
  }
}

// Global cached connection for Serverless / Lambda warm container reuse
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let isMongoConnected = false;

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return cached.conn;
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    isMongoConnected = true;
    return mongoose.connection;
  }

  if (cached.promise) {
    return cached.promise;
  }

  const primaryUri = ENV.MONGODB_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/recruitment_dashboard';

  const connectionOpts = {
    bufferCommands: false,
    maxPoolSize: isServerless ? 5 : 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000
  };

  cached.promise = (async () => {
    try {
      console.log(`📡 Connecting to MongoDB Atlas...`);
      const conn = await mongoose.connect(primaryUri, connectionOpts);
      isMongoConnected = true;
      cached.conn = conn;
      const hostPart = primaryUri.includes('@') ? primaryUri.split('@').pop() : primaryUri;
      console.log(`✅ MongoDB Atlas Connected Successfully (${hostPart})`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Primary MongoDB Atlas Connection Error (${err.message}).`);

      // Only attempt local fallback if running locally and not in serverless cloud
      if (!isServerless && !primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
        console.log(`🔄 Attempting automatic fallback to local MongoDB (127.0.0.1:27017)...`);
        try {
          const localConn = await mongoose.connect(localFallbackUri, {
            serverSelectionTimeoutMS: 2000
          });
          isMongoConnected = true;
          cached.conn = localConn;
          console.log(`✅ Connected to Local MongoDB fallback successfully!`);
          return localConn;
        } catch (localErr) {
          console.warn(`⚠️ Local MongoDB fallback also unavailable (${localErr.message}).`);
        }
      }

      isMongoConnected = false;
      console.log(`ℹ️ Running with Dual-Persistence (In-Memory Database Store active)`);
      return null;
    } finally {
      cached.promise = null;
    }
  })();

  return cached.promise;
}

export function getMongoConnectionStatus() {
  return mongoose.connection.readyState === 1 || isMongoConnected;
}

export async function ensureDBConnected() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  return mongoose.connection.readyState === 1;
}

