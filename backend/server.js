import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/database.js';
import { autoSeedDatabase } from './services/dbSeeder.js';
import { autoSeedUsers } from './services/userSeeder.js';
import { initSocket } from './sockets/socketHandler.js';
import { initResumeQueue } from './queues/resumeQueue.js';
import apiRouter from './routes/index.js';
import { startLinkedInAutoSyncScheduler } from './services/linkedinAutoFetcher.js';
import { initRealtimeDBSync } from './services/realtimeDBSync.js';

const app = express();
const httpServer = createServer(app);

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));

// WebSocket Initialization
const io = initSocket(httpServer);

// Mount API Routes
app.use('/api', apiRouter);

// Initialize Database Connection, Auto-seed, and Background Queue
connectDB().then(async () => {
  await autoSeedDatabase();
  await autoSeedUsers();
  await initResumeQueue();
});

// Start Server & Auto-Sync Scheduler
httpServer.listen(ENV.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Unified Recruitment Ingestion Gateway is LIVE!`);
  console.log(`📡 Server Address: http://localhost:${ENV.PORT}`);
  console.log(`💾 Database Mode: MongoDB Atlas with Mongoose ODM (Dual-Persistence)`);
  console.log(`⚡ WebSocket Server: Ready for Real-Time Dashboard Sync`);
  console.log(`💼 LinkedIn Ingestion: Live (Webhook + Email Auto-Fetcher)`);
  console.log(`=======================================================`);

  // Start 60-second automated inbox polling
  startLinkedInAutoSyncScheduler(io);

  // Initialize Real-time Database Bridge if dual local/cloud URIs are configured
  initRealtimeDBSync();
});

// Production Graceful Shutdown for Synology DSM / Docker Container Manager
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Executing graceful shutdown...`);
  httpServer.close(() => {
    console.log('✅ HTTP & WebSocket listeners terminated.');
  });
  try {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close(false);
    console.log('✅ MongoDB connection closed gracefully.');
  } catch (err) {
    // Ignore close error
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, httpServer, io };
