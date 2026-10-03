import { Router } from 'express';
import { getCalls, createCall, deleteCall } from '../controllers/callController.js';

const router = Router();

router.get('/', getCalls);
router.post('/', createCall);
router.delete('/:id', deleteCall);

export default router;
