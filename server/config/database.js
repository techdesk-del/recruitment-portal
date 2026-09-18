import mongoose from 'mongoose';
import { ENV } from './env.js';

let isMongoConnected = false;

export async function connectDB() {
  try {
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${ENV.MONGODB_URI.split('@').pop()}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB Local Connection Notice: ${err.message}`);
    console.log(`ℹ️ Running with Dual-Persistence (MongoDB when available + In-Memory Fallback)`);
  }
}

export function getMongoConnectionStatus() {
  return isMongoConnected;
}
