import { Router } from 'express';
import { getJobs, createJob, updateJob } from '../controllers/jobController.js';

const router = Router();

router.get('/', getJobs);
router.post('/', createJob);
router.patch('/:id', updateJob);

export default router;
