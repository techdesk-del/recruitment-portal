import { Job } from '../models/Job.js';
import { ensureDBConnected, getMongoConnectionStatus } from '../config/database.js';
import {
  broadcastJobCreated,
  broadcastJobUpdated,
  broadcastJobDeleted
} from '../sockets/socketHandler.js';

// In-memory cache for ultra-fast response & offline resilience
let inMemoryJobs = [];

export async function getJobs(req, res) {
  try {
    await ensureDBConnected();
    if (getMongoConnectionStatus()) {
      const jobs = await Job.find().sort({ createdAt: -1 });
      if (jobs && jobs.length > 0) {
        inMemoryJobs = jobs.map((j) => (j.toObject ? j.toObject() : j));
        return res.json(inMemoryJobs);
      }
    }
  } catch (err) {
    console.error('Error fetching jobs from MongoDB:', err.message);
  }
  return res.json(inMemoryJobs);
}

export async function createJob(req, res) {
  try {
    const jobData = req.body;
    if (!jobData || !jobData.title) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    if (!jobData.id) {
      jobData.id = `job-${Date.now().toString().slice(-6)}`;
    }
    let savedJob = { ...jobData };

    try {
      await ensureDBConnected();
      if (getMongoConnectionStatus()) {
        const saved = await Job.findOneAndUpdate(
          { id: jobData.id },
          { $set: jobData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (saved) {
          savedJob = saved.toObject ? saved.toObject() : saved;
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB job persist warning, using memory store:', dbErr.message);
    }

    inMemoryJobs = [savedJob, ...inMemoryJobs.filter((j) => j.id !== savedJob.id)];
    broadcastJobCreated(savedJob);
    return res.status(201).json(savedJob);
  } catch (err) {
    console.error('Error creating job:', err.message);
    res.status(500).json({ error: 'Failed to create job' });
  }
}

export async function updateJob(req, res) {
  const { id } = req.params;
  const updates = req.body;
  try {
    let resultJob = { id, ...updates };

    try {
      await ensureDBConnected();
      if (getMongoConnectionStatus()) {
        const updated = await Job.findOneAndUpdate(
          { id },
          { $set: updates },
          { new: true }
        );
        if (updated) {
          resultJob = updated.toObject ? updated.toObject() : updated;
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB job update warning, using memory store:', dbErr.message);
    }

    inMemoryJobs = inMemoryJobs.map((j) => (j.id === id ? { ...j, ...resultJob } : j));
    broadcastJobUpdated(resultJob);
    return res.json({ success: true, job: resultJob });
  } catch (err) {
    console.error('Error updating job:', err.message);
    res.status(500).json({ error: 'Failed to update job' });
  }
}

export async function deleteJob(req, res) {
  const { id } = req.params;
  try {
    try {
      await ensureDBConnected();
      if (getMongoConnectionStatus()) {
        await Job.findOneAndDelete({ id });
      }
    } catch (dbErr) {
      console.warn('MongoDB job delete warning:', dbErr.message);
    }

    inMemoryJobs = inMemoryJobs.filter((j) => j.id !== id);
    broadcastJobDeleted(id);
    return res.json({ success: true, id, message: 'Job Requisition deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err.message);
    res.status(500).json({ error: 'Failed to delete job' });
  }
}
