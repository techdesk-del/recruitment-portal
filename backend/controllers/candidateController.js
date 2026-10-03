import { Candidate } from '../models/Candidate.js';
import { getMongoConnectionStatus } from '../config/database.js';
import { getAllCandidatesFromStore, persistCandidate, deleteCandidateFromStore } from '../services/candidateStore.js';
import { 
  broadcastStatusUpdate, 
  broadcastNewCandidate, 
  broadcastCandidateUpdated, 
  broadcastCandidateDeleted 
} from '../sockets/socketHandler.js';

// Helper to update candidate fields in MongoDB
async function updateCandidateField(id, updates, extraPush = null) {
  if (!getMongoConnectionStatus()) return null;
  const updateQuery = {
    $set: { ...updates, lastUpdatedDate: new Date().toISOString() },
    ...(extraPush && { $push: extraPush })
  };
  return Candidate.findOneAndUpdate({ id }, updateQuery, { new: true });
}

// GET all candidates
export async function getCandidates(req, res) {
  try {
    if (getMongoConnectionStatus()) {
      const candidates = await Candidate.find().sort({ createdAt: -1 });
      return res.json(candidates);
    }
  } catch (err) {
    console.error('Error fetching candidates from MongoDB:', err.message);
  }
  const fallback = await getAllCandidatesFromStore();
  res.json(fallback);
}

// POST create single candidate
export async function createCandidate(req, res) {
  try {
    const data = req.body;
    if (!data?.name) {
      return res.status(400).json({ error: 'Candidate name is required' });
    }
    if (!data.id) {
      data.id = `cand-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    }

    const saved = await persistCandidate(data);
    broadcastNewCandidate(saved);
    res.status(201).json({ success: true, candidate: saved });
  } catch (err) {
    console.error('Error creating candidate:', err.message);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
}

// POST bulk create candidates
export async function bulkCreateCandidates(req, res) {
  try {
    const list = Array.isArray(req.body.candidates) ? req.body.candidates : [req.body];
    const results = [];

    for (const c of list) {
      if (c?.name) {
        if (!c.id) c.id = `cand-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
        const saved = await persistCandidate(c);
        results.push(saved);
        broadcastNewCandidate(saved);
      }
    }
    res.status(201).json({ success: true, count: results.length, candidates: results });
  } catch (err) {
    console.error('Error in bulkCreateCandidates:', err.message);
    res.status(500).json({ error: 'Failed to process bulk candidates' });
  }
}

// PATCH update status + add activity history
export async function updateCandidateStatus(req, res) {
  const { id } = req.params;
  const { status, details, performedBy } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: `Status updated to ${status.toUpperCase()}`,
    details: details || `Moved to ${status}`,
    performedBy: performedBy || 'Lead Recruiter',
    timestamp: new Date().toISOString(),
    type: 'status'
  };

  const updated = await updateCandidateField(
    id,
    { status },
    { activityHistory: { $each: [activityItem], $position: 0 } }
  );

  broadcastStatusUpdate({ id, status, activityItem });
  res.json({ success: true, id, status, candidate: updated || undefined });
}

// PATCH recruiter notes
export async function updateCandidateNotes(req, res) {
  const { id } = req.params;
  const { notes } = req.body;
  const updated = await updateCandidateField(id, { notes });
  broadcastCandidateUpdated(updated || { id, notes });
  res.json({ success: true, id, notes, candidate: updated || undefined });
}

// PATCH rating
export async function updateCandidateRating(req, res) {
  const { id } = req.params;
  const { rating } = req.body;
  const updated = await updateCandidateField(id, { rating });
  broadcastCandidateUpdated(updated || { id, rating });
  res.json({ success: true, id, rating, candidate: updated || undefined });
}

// PATCH assign recruiter
export async function updateCandidateRecruiter(req, res) {
  const { id } = req.params;
  const { recruiter } = req.body;
  const updated = await updateCandidateField(id, { recruiterAssigned: recruiter });
  broadcastCandidateUpdated(updated || { id, recruiterAssigned: recruiter });
  res.json({ success: true, id, recruiter, candidate: updated || undefined });
}

// PATCH interview scorecard
export async function updateCandidateScorecard(req, res) {
  const { id } = req.params;
  const { scorecard } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: 'Interview Scorecard Recorded',
    details: `Evaluation recommendation: ${scorecard?.overallRecommendation?.toUpperCase() || 'EVALUATED'}`,
    performedBy: scorecard?.evaluatedBy || 'Interviewer',
    timestamp: new Date().toISOString(),
    type: 'scorecard'
  };

  const updated = await updateCandidateField(
    id,
    { scorecard },
    { activityHistory: { $each: [activityItem], $position: 0 } }
  );

  broadcastCandidateUpdated(updated || { id, scorecard });
  res.json({ success: true, id, scorecard, candidate: updated || undefined });
}

// PATCH calling details & queue status
export async function updateCandidateCallingDetails(req, res) {
  const { id } = req.params;
  const updates = req.body;

  const payload = {
    ...(updates.callingDetails && { callingDetails: updates.callingDetails }),
    ...(updates.isCallingQueued !== undefined && { isCallingQueued: updates.isCallingQueued })
  };

  const updated = await updateCandidateField(id, payload);
  broadcastCandidateUpdated(updated || { id, ...payload });
  res.json({ success: true, id, updates, candidate: updated || undefined });
}

// PATCH generic candidate update
export async function updateCandidate(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates._id;

  const updated = await updateCandidateField(id, updates);
  broadcastCandidateUpdated(updated || { id, ...updates });
  res.json({ success: true, id, candidate: updated || updates });
}

// DELETE candidate
export async function deleteCandidate(req, res) {
  const { id } = req.params;
  try {
    await deleteCandidateFromStore(id);
    broadcastCandidateDeleted(id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Failed to delete candidate:', err.message);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
}
