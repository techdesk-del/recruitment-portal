import { Router } from 'express';
import { 
  getCandidates, 
  updateCandidateStatus, 
  updateCandidateNotes, 
  updateCandidateScorecard,
  createCandidate,
  bulkCreateCandidates
} from '../controllers/candidateController.js';

const router = Router();

router.get('/', getCandidates);
router.post('/', createCandidate);
router.post('/bulk', bulkCreateCandidates);
router.patch('/:id/status', updateCandidateStatus);
router.patch('/:id/notes', updateCandidateNotes);
router.patch('/:id/scorecard', updateCandidateScorecard);

export default router;
