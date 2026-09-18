import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/database.js';
import { initSocket } from './sockets/socketHandler.js';
import apiRouter from './routes/index.js';
import { startLinkedInAutoSyncScheduler } from './services/linkedinAutoFetcher.js';

const app = express();
const httpServer = createServer(app);

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// WebSocket Initialization
const io = initSocket(httpServer);

// Mount API Routes
app.use('/api', apiRouter);

// Initialize Database Connection
connectDB();

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
});

export { app, httpServer, io };
