import { Job } from '../models/Job.js';
import { getMongoConnectionStatus } from '../config/database.js';

export async function getJobs(req, res) {
  try {
    if (getMongoConnectionStatus()) {
      const jobs = await Job.find().sort({ createdAt: -1 });
      return res.json(jobs);
    }
  } catch (err) {
    console.error('Error fetching jobs from MongoDB:', err);
  }
  res.json([]);
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
    if (getMongoConnectionStatus()) {
      const saved = await Job.findOneAndUpdate(
        { id: jobData.id },
        jobData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.status(201).json(saved);
    }
    res.status(201).json(jobData);
  } catch (err) {
    console.error('Error creating job in MongoDB:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
}

export async function updateJob(req, res) {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (getMongoConnectionStatus()) {
      const updated = await Job.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true }
      );
      return res.json({ success: true, job: updated });
    }
    res.json({ success: true, id, updates });
  } catch (err) {
    console.error('Error updating job in MongoDB:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
}
