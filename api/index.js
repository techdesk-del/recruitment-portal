import express from 'express';
import cors from 'cors';
import { connectDB, getMongoConnectionStatus } from '../backend/config/database.js';
import apiRouter from '../backend/routes/index.js';

const app = express();

// Enable Cross-Origin Resource Sharing for any remote client worldwide
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure MongoDB Atlas connection on serverless cold starts
let isConnecting = false;
app.use(async (req, res, next) => {
  if (!getMongoConnectionStatus() && !isConnecting) {
    isConnecting = true;
    try {
      await connectDB();
    } catch (e) {
      console.warn('[Vercel Serverless] DB connection note:', e.message);
    } finally {
      isConnecting = false;
    }
  }
  next();
});

// Gateway Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    gateway: 'UrbanGaon Global Real-Time Cloud Gateway',
    database: getMongoConnectionStatus() ? 'MongoDB Atlas Connected' : 'Connecting...',
    timestamp: new Date().toISOString()
  });
});

// Mount all backend API routes under /api
app.use('/api', apiRouter);

export default app;
