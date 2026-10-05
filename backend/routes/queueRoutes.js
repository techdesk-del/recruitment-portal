import { Router } from 'express';
import { 
  enqueueBulkResumes, 
  getBatchStatus, 
  getQueueMetrics, 
  clearQueue 
} from '../queues/resumeQueue.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/queue/resumes/bulk - Enqueue resumes for decoupled background parsing
router.post('/resumes/bulk', requireAuth, async (req, res) => {
  try {
    const { batchId, items, options } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of resume items to enqueue.' });
    }

    const cleanBatchId = batchId || `batch-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const result = await enqueueBulkResumes(cleanBatchId, items, options || {});

    // HTTP 202 Accepted indicates decoupled background execution
    return res.status(202).json({
      success: true,
      message: `Enqueued ${items.length} resumes for background worker processing.`,
      batchId: cleanBatchId,
      enqueuedCount: items.length,
      mode: result.mode,
      concurrency: result.concurrency
    });
  } catch (err) {
    console.error('Queue enqueue error:', err);
    return res.status(500).json({ error: 'Failed to enqueue resumes: ' + err.message });
  }
});

// GET /api/queue/batch/:batchId - Polling & status endpoint for batch progress
router.get('/batch/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;
    const status = getBatchStatus(batchId);
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch batch status.' });
  }
});

// GET /api/queue/metrics - System queue health and active workers
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getQueueMetrics();
    return res.json(metrics);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch queue metrics.' });
  }
});

// POST /api/queue/clear - Clear tracked batches and completed jobs
router.post('/clear', requireAuth, async (req, res) => {
  try {
    const result = await clearQueue();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear queue.' });
  }
});

export default router;
