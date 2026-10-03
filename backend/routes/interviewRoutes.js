import { Router } from 'express';
import { 
  getInterviews, 
  createInterview, 
  updateInterview, 
  deleteInterview 
} from '../controllers/interviewController.js';

const router = Router();

router.get('/', getInterviews);
router.post('/', createInterview);
router.patch('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
