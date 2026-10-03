import { Router } from 'express';
import { triggerLinkedInSync } from '../controllers/syncController.js';

const router = Router();

router.post('/linkedin-now', triggerLinkedInSync);

export default router;
