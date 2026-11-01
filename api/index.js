import express from 'express';
import cors from 'cors';
import { connectDB, getMongoConnectionStatus } from '../backend/config/database.js';
import { autoSeedUsers } from '../backend/services/userSeeder.js';
import apiRouter from '../backend/routes/index.js';

const app = express();

// Enable Cross-Origin Resource Sharing for any remote client worldwide
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

let isSeeded = false;

// Ensure MongoDB Atlas connection on every request before routing
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded) {
      isSeeded = true;
      autoSeedUsers().catch(() => {});
    }
  } catch (e) {
    console.warn('[Serverless Gateway] DB connection warning:', e.message);
  }
  next();
});

// Gateway Health & Diagnostic Endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    gateway: 'UrbanGaon Global Real-Time Cloud Gateway',
    database: getMongoConnectionStatus() ? 'MongoDB Atlas Connected' : 'Connecting...',
    timestamp: new Date().toISOString()
  });
});

// Mount all backend API routes under both /api and / (handles Vercel rewrite variations)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global JSON error handler so frontend never receives unformatted HTML 500 errors
app.use((err, req, res, next) => {
  console.error('[Serverless Gateway Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

export default app;
