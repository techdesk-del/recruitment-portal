import { Candidate } from '../models/Candidate.js';
import { getMongoConnectionStatus } from '../config/database.js';
import { getAllCandidatesFromStore } from '../services/candidateStore.js';
import { broadcastStatusUpdate } from '../sockets/socketHandler.js';

export async function getCandidates(req, res) {
  const candidates = await getAllCandidatesFromStore();
  res.json(candidates);
}

export async function updateCandidateStatus(req, res) {
  const { id } = req.params;
  const { status, details, performedBy } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: `Status updated to ${status.toUpperCase()}`,
    details: details || `Moved to ${status}`,
    performedBy: performedBy || 'Recruiter',
    timestamp: new Date().toISOString(),
    type: 'status'
  };

  try {
    if (getMongoConnectionStatus()) {
      const updated = await Candidate.findOneAndUpdate(
        { id },
        { 
          $set: { status, lastUpdatedDate: new Date().toISOString() },
          $push: { activityHistory: { $each: [activityItem], $position: 0 } }
        },
        { new: true }
      );
      if (updated) {
        broadcastStatusUpdate({ id, status, activityItem });
        return res.json({ success: true, candidate: updated });
      }
    }
  } catch (e) {
    console.error('Failed to update status in MongoDB:', e);
  }

  broadcastStatusUpdate({ id, status, activityItem });
  res.json({ success: true, id, status });
}

export async function updateCandidateNotes(req, res) {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    if (getMongoConnectionStatus()) {
      await Candidate.findOneAndUpdate(
        { id },
        { $set: { notes, lastUpdatedDate: new Date().toISOString() } }
      );
    }
  } catch (e) {
    console.error('Failed to save notes in MongoDB:', e);
  }

  res.json({ success: true, id, notes });
}

export async function updateCandidateScorecard(req, res) {
  const { id } = req.params;
  const { scorecard } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: 'Interview Scorecard Recorded',
    details: `Evaluation recommendation: ${scorecard?.overallRecommendation?.toUpperCase()}`,
    performedBy: scorecard?.evaluatedBy || 'Interviewer',
    timestamp: new Date().toISOString(),
    type: 'scorecard'
  };

  try {
    if (getMongoConnectionStatus()) {
      await Candidate.findOneAndUpdate(
        { id },
        { 
          $set: { scorecard, lastUpdatedDate: new Date().toISOString() },
          $push: { activityHistory: { $each: [activityItem], $position: 0 } }
        }
      );
    }
  } catch (e) {
    console.error('Failed to save scorecard in MongoDB:', e);
  }

  res.json({ success: true, id, scorecard });
}

export async function createCandidate(req, res) {
  try {
    const candidateData = req.body;
    if (!candidateData || !candidateData.name) {
      return res.status(400).json({ error: 'Candidate name is required' });
    }
    const saved = await persistCandidate(candidateData);
    res.status(201).json({ success: true, candidate: saved });
  } catch (err) {
    console.error('Error creating candidate:', err);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
}

export async function bulkCreateCandidates(req, res) {
  try {
    const { candidates } = req.body;
    const list = Array.isArray(candidates) ? candidates : [req.body];
    const results = [];
    for (const c of list) {
      if (c && c.name) {
        const saved = await persistCandidate(c);
        results.push(saved);
      }
    }
    res.status(201).json({ success: true, count: results.length, candidates: results });
  } catch (err) {
    console.error('Error in bulkCreateCandidates:', err);
    res.status(500).json({ error: 'Failed to process bulk candidates' });
  }
}
