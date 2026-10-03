import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

// Set public reliable DNS servers for Node.js SRV record lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if DNS server override is restricted
}

let isMongoConnected = false;
let connectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const primaryUri = ENV.MONGODB_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/recruitment_dashboard';

  connectionPromise = (async () => {
    try {
      console.log(`📡 Connecting to MongoDB Atlas...`);
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 8000
      });
      isMongoConnected = true;
      const hostPart = primaryUri.includes('@') ? primaryUri.split('@').pop() : primaryUri;
      console.log(`✅ MongoDB Atlas Connected Successfully (${hostPart})`);
      return mongoose.connection;
    } catch (err) {
      console.warn(`⚠️ Primary MongoDB Atlas Connection Error (${err.message}).`);

      // If primary failed and it wasn't already local, try the running local MongoDB instance
      if (!primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
        console.log(`🔄 Attempting automatic fallback to local MongoDB (127.0.0.1:27017)...`);
        try {
          await mongoose.connect(localFallbackUri, {
            serverSelectionTimeoutMS: 3000
          });
          isMongoConnected = true;
          console.log(`✅ Connected to Local MongoDB fallback successfully (127.0.0.1:27017/recruitment_dashboard)!`);
          return mongoose.connection;
        } catch (localErr) {
          console.warn(`⚠️ Local MongoDB fallback also unavailable (${localErr.message}).`);
        }
      }

      isMongoConnected = false;
      console.log(`ℹ️ Running with Dual-Persistence (In-Memory Database Store active)`);
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
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
