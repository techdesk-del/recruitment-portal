import { Router } from 'express';
import { getJobs, createJob, updateJob, deleteJob } from '../controllers/jobController.js';

const router = Router();

router.get('/', getJobs);
router.post('/', createJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
