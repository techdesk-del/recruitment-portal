import express from 'express';
import cors from 'cors';
import { connectDB, getMongoConnectionStatus } from '../backend/config/database.js';
import apiRouter from '../backend/routes/index.js';

const app = express();

// Enable Cross-Origin Resource Sharing for any remote client worldwide
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure MongoDB Atlas connection on every request before routing
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.warn('[Serverless Gateway] DB connection warning:', e.message);
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
