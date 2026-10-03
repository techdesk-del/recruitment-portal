import { Candidate } from '../models/Candidate.js';
import { getMongoConnectionStatus } from '../config/database.js';
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

export async function persistCandidate(candidateData) {
  try {
    if (getMongoConnectionStatus()) {
      const saved = await Candidate.findOneAndUpdate(
        { $or: [{ id: candidateData.id }, { email: candidateData.email }] },
        candidateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return saved.toObject();
    }
  } catch (e) {
    console.error('MongoDB write error:', e.message);
  }

  // In-Memory fallback
  const idx = memoryCandidates.findIndex(
    (c) => c.id === candidateData.id || c.email === candidateData.email
  );
  if (idx >= 0) {
    memoryCandidates[idx] = candidateData;
  } else {
    memoryCandidates.unshift(candidateData);
  }
  return candidateData;
}

export async function getAllCandidatesFromStore() {
  try {
    if (getMongoConnectionStatus()) {
      return await Candidate.find().sort({ createdAt: -1 });
    }
  } catch (err) {
    console.error('Error fetching candidates from MongoDB:', err);
  }
  return memoryCandidates;
}

export function getMemoryCandidates() {
  return memoryCandidates;
}

export async function deleteCandidateFromStore(id) {
  try {
    if (getMongoConnectionStatus()) {
      const deleteConditions = [{ id: id }];
      if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
        deleteConditions.push({ _id: id });
      }
      const deletedDoc = await Candidate.findOneAndDelete({ $or: deleteConditions });
      if (deletedDoc) {
        console.log(`[Store] Successfully deleted candidate from MongoDB: ${deletedDoc.name} (${id})`);
      }
    }
  } catch (err) {
    console.error('Error deleting candidate from MongoDB:', err.message);
  }

  // Remove from memory fallback store
  memoryCandidates = memoryCandidates.filter((c) => c.id !== id && String(c._id) !== id);
  return true;
}
