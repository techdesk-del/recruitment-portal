import { getMongoConnectionStatus } from '../config/database.js';

export function getHealthStatus(req, res) {
  res.json({
    status: 'online',
    database: getMongoConnectionStatus() ? 'MongoDB (Connected)' : 'In-Memory / Awaiting MongoDB Local Service',
    service: 'UrbanGaon Unified Recruitment Ingestion Gateway',
    timestamp: new Date().toISOString(),
    webhooks: [
      'POST /api/webhook/naukri',
      'POST /api/webhook/linkedin',
      'POST /api/webhook/apna',
      'POST /api/webhook/indeed',
      'POST /api/careers/apply'
    ]
  });
}
