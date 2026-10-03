import { Candidate } from '../models/Candidate.js';
import { ensureDBConnected, getMongoConnectionStatus } from '../config/database.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryCandidates = [];
try {
  const seedPath = path.join(__dirname, '../data/seedData.json');
  if (fs.existsSync(seedPath)) {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    if (Array.isArray(raw.candidates)) {
      memoryCandidates = [...raw.candidates];
    }
  }
} catch (e) {
  // Ignore fallback load error
}

// Clean and sanitize candidate payload for reliable persistence
function sanitizeCandidate(data) {
  const sanitized = { ...data };
  if (!sanitized.id) {
    sanitized.id = `cand-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  if (!sanitized.name) {
    sanitized.name = 'Unnamed Candidate';
  }
  if (!sanitized.email || typeof sanitized.email !== 'string' || !sanitized.email.trim()) {
    sanitized.email = `${sanitized.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@candidate.org`;
  }
  if (!sanitized.phone) {
    sanitized.phone = '+91 98290 00000';
  }
  //
  if (!sanitized.source) {
    sanitized.source = 'urbangaon';
  }
  if (!sanitized.jobAppliedFor) {
    sanitized.jobAppliedFor = 'General Application';
  }
  if (!sanitized.jobId) {
    sanitized.jobId = 'job-general';
  }
  if (!sanitized.status) {
    sanitized.status = 'applied';
  }
  if (!sanitized.appliedDate) {
    sanitized.appliedDate = new Date().toISOString();
  }
  sanitized.lastUpdatedDate = new Date().toISOString();
  return sanitized;
}

export async function persistCandidate(candidateData) {
  const cleanData = sanitizeCandidate(candidateData);

  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const saved = await Candidate.findOneAndUpdate(
        { id: cleanData.id },
        cleanData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`[Store] Successfully persisted to MongoDB Atlas: ${cleanData.name} (${cleanData.id})`);

      // Update in-memory copy
      const idx = memoryCandidates.findIndex((c) => c.id === cleanData.id);
      if (idx >= 0) {
        memoryCandidates[idx] = saved.toObject();
      } else {
        memoryCandidates.unshift(saved.toObject());
      }

      return saved.toObject();
    }
  } catch (e) {
    console.error('MongoDB write error in persistCandidate:', e.message);
  }

  // Fallback to In-Memory store if MongoDB is down
  const idx = memoryCandidates.findIndex((c) => c.id === cleanData.id);
  if (idx >= 0) {
    memoryCandidates[idx] = cleanData;
  } else {
    memoryCandidates.unshift(cleanData);
  }
  return cleanData;
}

export async function getAllCandidatesFromStore() {
  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const candidates = await Candidate.find().sort({ createdAt: -1 });
      if (Array.isArray(candidates) && candidates.length > 0) {
        // Sync in-memory store with fresh Atlas state
        memoryCandidates = candidates.map(c => c.toObject());
        return candidates;
      }
    }
  } catch (err) {
    console.error('Error fetching candidates from MongoDB:', err.message);
  }
  return memoryCandidates;
}

export function getMemoryCandidates() {
  return memoryCandidates;
}

export async function deleteCandidateFromStore(id) {
  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const deleteConditions = [{ id: id }];
      if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
        deleteConditions.push({ _id: id });
      }
      const deletedDoc = await Candidate.findOneAndDelete({ $or: deleteConditions });
      if (deletedDoc) {
        console.log(`[Store] Successfully deleted from MongoDB Atlas: ${deletedDoc.name} (${id})`);
      }
    }
  } catch (err) {
    console.error('Error deleting candidate from MongoDB:', err.message);
  }

  // Remove from memory fallback store
  memoryCandidates = memoryCandidates.filter((c) => c.id !== id && String(c._id) !== id);
  return true;
}
