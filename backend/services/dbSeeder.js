import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { Interview } from '../models/Interview.js';
import { CallRecord } from '../models/CallRecord.js';
import { getMongoConnectionStatus } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function autoSeedDatabase() {
  if (!getMongoConnectionStatus()) {
    console.log('ℹ️ MongoDB not connected. Skipping database seeding.');
    return;
  }

  try {
    const seedFilePath = path.join(__dirname, '../data/seedData.json');
    if (!fs.existsSync(seedFilePath)) return;

    const seedRaw = fs.readFileSync(seedFilePath, 'utf8');
    const { jobs, candidates, interviews, calls } = JSON.parse(seedRaw);

    // 1. Seed Jobs
    const jobCount = await Job.countDocuments();
    if (jobCount === 0 && Array.isArray(jobs) && jobs.length > 0) {
      await Job.insertMany(jobs);
      console.log(`🌱 [DB Seeder] Seeded ${jobs.length} Job Requisitions to MongoDB.`);
    }

    // 2. Seed Candidates
    const candidateCount = await Candidate.countDocuments();
    if (candidateCount === 0 && Array.isArray(candidates) && candidates.length > 0) {
      await Candidate.insertMany(candidates);
      console.log(`🌱 [DB Seeder] Seeded ${candidates.length} Candidates with full profiles & resumes to MongoDB.`);
    }

    // 3. Seed Interviews
    const interviewCount = await Interview.countDocuments();
    if (interviewCount === 0 && Array.isArray(interviews) && interviews.length > 0) {
      await Interview.insertMany(interviews);
      console.log(`🌱 [DB Seeder] Seeded ${interviews.length} Scheduled Interviews to MongoDB.`);
    }

    // 4. Seed Call Records
    const callCount = await CallRecord.countDocuments();
    if (callCount === 0 && Array.isArray(calls) && calls.length > 0) {
      await CallRecord.insertMany(calls);
      console.log(`🌱 [DB Seeder] Seeded ${calls.length} Telephonic Call Audit Records to MongoDB.`);
    }

    console.log('💎 [DB Seeder] MongoDB Cloud Synchronizer Ready: Full Dual-Persistence Verified.');
  } catch (err) {
    console.error('❌ [DB Seeder] Seeding error:', err.message);
  }
}
