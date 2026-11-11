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
  if (!sanitized.name || /^farvision\s*erp$/i.test(sanitized.name?.trim())) {
    sanitized.name = /^farvision\s*erp$/i.test(sanitized.name?.trim()) 
      ? 'Narendra Singh Gurjar (N.S. Gurjar)' 
      : 'Unnamed Candidate';
  }
  // Never fabricate contact details — keep blank so HR can see & fill the real value.
  if (typeof sanitized.email !== 'string' || /@candidate\.org$/i.test(sanitized.email)) {
    sanitized.email = '';
  } else {
    sanitized.email = sanitized.email.trim().toLowerCase();
  }
  if (typeof sanitized.phone !== 'string' || /98290\s?(00000|12345)/.test(sanitized.phone)) {
    sanitized.phone = '';
  } else {
    sanitized.phone = sanitized.phone.trim();
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
      ).lean();

      const result = saved ? (saved.toObject ? saved.toObject() : saved) : cleanData;
      console.log(`[Store] Successfully persisted to MongoDB Atlas: ${cleanData.name} (${cleanData.id})`);

      // Update in-memory copy
      const idx = memoryCandidates.findIndex((c) => c.id === cleanData.id);
      if (idx >= 0) {
        memoryCandidates[idx] = result;
      } else {
        memoryCandidates.unshift(result);
      }

      return result;
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
      const candidates = await Candidate.find().sort({ createdAt: -1 }).lean();
      if (Array.isArray(candidates) && candidates.length > 0) {
        // Sync in-memory store with fresh Atlas state and clean
        memoryCandidates = candidates.map(sanitizeCandidate);
        return memoryCandidates;
      }
    }
  } catch (err) {
    console.error('Error fetching candidates from MongoDB:', err.message);
  }
  return memoryCandidates.map(sanitizeCandidate);
}

export function getMemoryCandidates() {
  return memoryCandidates;
}

export async function updateCandidateInStore(id, updates, extraPush = null) {
  let updatedDoc = null;
  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const updateQuery = {
        $set: { ...updates, lastUpdatedDate: new Date().toISOString() },
        ...(extraPush && { $push: extraPush })
      };
      const query = mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      updatedDoc = await Candidate.findOneAndUpdate(query, updateQuery, { new: true }).lean();
      if (updatedDoc) {
        console.log(`[Store] Successfully updated candidate in MongoDB: ${updatedDoc.name} (${id})`);
      }
    }
  } catch (err) {
    console.error('MongoDB update error in updateCandidateInStore:', err.message);
  }

  // Update in-memory copy synchronously
  const idx = memoryCandidates.findIndex((c) => c.id === id || String(c._id) === id);
  if (idx >= 0) {
    if (updatedDoc) {
      memoryCandidates[idx] = updatedDoc;
    } else {
      memoryCandidates[idx] = {
        ...memoryCandidates[idx],
        ...updates,
        lastUpdatedDate: new Date().toISOString()
      };
    }
    return updatedDoc || memoryCandidates[idx];
  }

  return updatedDoc || { id, ...updates };
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
