import { Candidate } from '../models/Candidate.js';
import { getMongoConnectionStatus } from '../config/database.js';

let memoryCandidates = [];

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
