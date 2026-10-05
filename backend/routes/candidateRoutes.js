import { Router } from 'express';
import { 
  getCandidates, 
  createCandidate,
  bulkCreateCandidates,
  updateCandidate,
  updateCandidateStatus, 
  updateCandidateNotes, 
  updateCandidateScorecard,
  updateCandidateRating,
  updateCandidateRecruiter,
  updateCandidateCallingDetails,
  deleteCandidate
} from '../controllers/candidateController.js';
import {
  exportCandidateTrackerExcel,
  exportCandidateTrackerCSV
} from '../controllers/exportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Export endpoints (placed before /:id routes)
router.get('/export/excel', exportCandidateTrackerExcel);
router.get('/export/tracker-sheet', exportCandidateTrackerExcel);
router.get('/export/csv', exportCandidateTrackerCSV);

router.get('/', getCandidates);
router.post('/', requireAuth, requireRole('admin', 'recruiter'), createCandidate);
router.post('/bulk', requireAuth, requireRole('admin', 'recruiter'), bulkCreateCandidates);
router.put('/:id', requireAuth, updateCandidate);
router.patch('/:id', requireAuth, updateCandidate);
router.patch('/:id/status', requireAuth, updateCandidateStatus);
router.patch('/:id/notes', requireAuth, updateCandidateNotes);
router.patch('/:id/rating', requireAuth, updateCandidateRating);
router.patch('/:id/recruiter', requireAuth, updateCandidateRecruiter);
router.patch('/:id/scorecard', requireAuth, updateCandidateScorecard);
router.patch('/:id/calling', requireAuth, updateCandidateCallingDetails);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCandidate);

export default router;
