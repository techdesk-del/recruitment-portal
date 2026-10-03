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

const router = Router();

// Export endpoints (placed before /:id routes)
router.get('/export/excel', exportCandidateTrackerExcel);
router.get('/export/tracker-sheet', exportCandidateTrackerExcel);
router.get('/export/csv', exportCandidateTrackerCSV);

router.get('/', getCandidates);
router.post('/', createCandidate);
router.post('/bulk', bulkCreateCandidates);
router.put('/:id', updateCandidate);
router.patch('/:id', updateCandidate);
router.patch('/:id/status', updateCandidateStatus);
router.patch('/:id/notes', updateCandidateNotes);
router.patch('/:id/rating', updateCandidateRating);
router.patch('/:id/recruiter', updateCandidateRecruiter);
router.patch('/:id/scorecard', updateCandidateScorecard);
router.patch('/:id/calling', updateCandidateCallingDetails);
router.delete('/:id', deleteCandidate);

export default router;
