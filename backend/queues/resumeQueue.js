import { Queue, Worker } from 'bullmq';
import { testRedisConnection, getRedisConfig, createRedisClient } from './redisClient.js';
import { processResumeExtraction } from './resumeExtractor.js';
import { persistCandidate } from '../services/candidateStore.js';
import { 
  broadcastNewCandidate, 
  broadcastQueueProgress, 
  broadcastQueueBatchCompleted 
} from '../sockets/socketHandler.js';

const QUEUE_NAME = 'bulk-resume-queue';

let bullQueue = null;
let bullWorker = null;
let isBullActive = false;

// In-Memory Decoupled Asynchronous Queue Fallback
class AsyncMemoryQueue {
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
    this.queue = [];
    this.activeWorkers = 0;
    this.completedCount = 0;
    this.failedCount = 0;
  }

  add(jobData) {
    const job = {
      id: `mem-job-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      data: jobData,
      status: 'waiting',
      timestamp: Date.now()
    };
    this.queue.push(job);
    setImmediate(() => this.processNext());
    return job;
  }

  async processNext() {
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;
    job.status = 'active';

    try {
      await executeWorkerJob(job.data, (progress) => {
        job.progress = progress;
      });
      job.status = 'completed';
      this.completedCount++;
    } catch (err) {
      job.status = 'failed';
      job.error = err.message;
      this.failedCount++;
    } finally {
      this.activeWorkers--;
      setImmediate(() => this.processNext());
    }
  }

  getMetrics() {
    return {
      mode: 'decoupled-async-worker',
      waiting: this.queue.length,
      active: this.activeWorkers,
      completed: this.completedCount,
      failed: this.failedCount
    };
  }
}

const memoryQueue = new AsyncMemoryQueue(4);

// Batch status tracker in memory
const batchStatusMap = new Map();

/**
 * Executes a single resume job in background (used by both BullMQ & Fallback Queue)
 */
async function executeWorkerJob(jobData, updateProgress = () => {}) {
  const { batchId } = jobData;
  updateProgress(20);

  // 1. Background parsing & ATS extraction
  const candidatePayload = await processResumeExtraction(jobData);
  updateProgress(60);

  // 2. Persist candidate to MongoDB Atlas / Dual Store
  const saved = await persistCandidate(candidatePayload);
  updateProgress(90);

  // 3. Broadcast real-time candidate to all connected clients
  broadcastNewCandidate(saved);

  // 4. Update batch tracker
  if (batchId && batchStatusMap.has(batchId)) {
    const batch = batchStatusMap.get(batchId);
    batch.completed++;
    batch.results.push(saved);
    batch.percent = Math.round((batch.completed / batch.total) * 100);

    const progressPayload = {
      batchId,
      completed: batch.completed,
      total: batch.total,
      percent: batch.percent,
      lastCandidate: {
        id: saved.id,
        name: saved.name,
        jobAppliedFor: saved.jobAppliedFor
      }
    };

    broadcastQueueProgress(progressPayload);

    if (batch.completed >= batch.total) {
      batch.status = 'completed';
      broadcastQueueBatchCompleted({
        batchId,
        total: batch.total,
        candidates: batch.results
      });
      console.log(`🎉 [Queue] Batch ${batchId} completed! Ingested ${batch.completed} candidates.`);
    }
  }

  updateProgress(100);
  return saved;
}

/**
 * Initializes the Queue (BullMQ if Redis is active, else Fallback Async Queue)
 */
export async function initResumeQueue() {
  const redisCheck = await testRedisConnection();

  if (redisCheck && redisCheck.ok) {
    try {
      const redisConfig = getRedisConfig();
      const connection = typeof redisConfig === 'string' 
        ? createRedisClient() 
        : { host: redisConfig.host, port: redisConfig.port, password: redisConfig.password, maxRetriesPerRequest: null };

      bullQueue = new Queue(QUEUE_NAME, { 
        connection,
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 200,
          attempts: 2,
          backoff: { type: 'exponential', delay: 1000 }
        }
      });

      bullWorker = new Worker(QUEUE_NAME, async (job) => {
        return await executeWorkerJob(job.data, (progress) => {
          job.updateProgress(progress).catch(() => {});
        });
      }, {
        connection,
        concurrency: 4 // Decoupled 4 concurrent background workers
      });

      bullWorker.on('completed', (job) => {
        console.log(`⚡ [BullMQ Worker] Job ${job.id} completed: ${job.data.fileName || 'Resume'}`);
      });

      bullWorker.on('failed', (job, err) => {
        console.error(`⚠️ [BullMQ Worker] Job ${job?.id} failed:`, err.message);
        if (job?.data?.batchId && batchStatusMap.has(job.data.batchId)) {
          const batch = batchStatusMap.get(job.data.batchId);
          batch.failed++;
        }
      });

      isBullActive = true;
      console.log('⚡ [BullMQ] Bulk Resume Worker Queue is active with Redis concurrency 4');
      return;
    } catch (err) {
      console.warn('⚠️ [BullMQ] Initialization note, using async memory queue:', err.message);
    }
  }

  isBullActive = false;
  console.log('📦 [Queue] Using Decoupled Asynchronous Worker Queue (concurrency 4)');
}

/**
 * Enqueue a batch of resumes for decoupled background processing
 */
export async function enqueueBulkResumes(batchId, items, options = {}) {
  const total = items.length;

  // Initialize batch tracker
  batchStatusMap.set(batchId, {
    batchId,
    total,
    completed: 0,
    failed: 0,
    percent: 0,
    status: 'processing',
    startTime: Date.now(),
    results: []
  });

  const enqueuedJobs = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const jobData = {
      batchId,
      index: i + 1,
      total,
      fileName: item.fileName || `Resume_${i + 1}.pdf`,
      textContent: item.textContent || item.summary || '',
      candidateDraft: item.candidate || item.candidateDraft || null,
      options
    };

    if (isBullActive && bullQueue) {
      const job = await bullQueue.add('parse-resume', jobData);
      enqueuedJobs.push(job.id);
    } else {
      const job = memoryQueue.add(jobData);
      enqueuedJobs.push(job.id);
    }
  }

  return {
    success: true,
    batchId,
    enqueuedCount: total,
    mode: isBullActive ? 'bullmq-redis' : 'decoupled-async-worker',
    concurrency: 4
  };
}

/**
 * Retrieve batch processing status
 */
export function getBatchStatus(batchId) {
  if (batchStatusMap.has(batchId)) {
    return batchStatusMap.get(batchId);
  }
  return {
    batchId,
    status: 'not_found',
    total: 0,
    completed: 0,
    percent: 100,
    results: []
  };
}

/**
 * Retrieve overall queue health and active metrics
 */
export async function getQueueMetrics() {
  if (isBullActive && bullQueue) {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        bullQueue.getWaitingCount(),
        bullQueue.getActiveCount(),
        bullQueue.getCompletedCount(),
        bullQueue.getFailedCount()
      ]);

      return {
        mode: 'bullmq-redis',
        isRedisConnected: true,
        concurrency: 4,
        waiting,
        active,
        completed,
        failed,
        trackedBatches: batchStatusMap.size
      };
    } catch {
      // Fallback
    }
  }

  const mem = memoryQueue.getMetrics();
  return {
    ...mem,
    isRedisConnected: false,
    concurrency: 4,
    trackedBatches: batchStatusMap.size
  };
}

/**
 * Clear queue
 */
export async function clearQueue() {
  if (isBullActive && bullQueue) {
    await bullQueue.drain();
    await bullQueue.clean(0, 1000, 'completed');
    await bullQueue.clean(0, 1000, 'failed');
  }
  batchStatusMap.clear();
  return { success: true };
}
