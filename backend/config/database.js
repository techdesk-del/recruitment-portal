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

export async function connectDB() {
  const primaryUri = ENV.MONGODB_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/recruitment_dashboard';

  try {
    console.log(`📡 Connecting to MongoDB...`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${primaryUri.includes('@') ? primaryUri.split('@').pop() : primaryUri}`);
    return;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB Connection Error (${err.message}).`);

    // If primary failed and it wasn't already local, try the running local MongoDB instance
    if (!primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
      console.log(`🔄 Attempting automatic fallback to local MongoDB (127.0.0.1:27017)...`);
      try {
        await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 3000
        });
        isMongoConnected = true;
        console.log(`✅ Connected to Local MongoDB fallback successfully (127.0.0.1:27017/recruitment_dashboard)!`);
        return;
      } catch (localErr) {
        console.warn(`⚠️ Local MongoDB fallback also unavailable (${localErr.message}).`);
      }
    }

    isMongoConnected = false;
    console.log(`ℹ️ Running with Dual-Persistence (In-Memory Database Store active)`);
  }
}

export function getMongoConnectionStatus() {
  return isMongoConnected;
}

