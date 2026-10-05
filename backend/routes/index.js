import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import jobRoutes from './jobRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import callRoutes from './callRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import syncRoutes from './syncRoutes.js';
import authRoutes from './authRoutes.js';
import queueRoutes from './queueRoutes.js';
import communicationRoutes from './communicationRoutes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/queue', queueRoutes);
apiRouter.use('/communications', communicationRoutes);
apiRouter.use('/candidates', candidateRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/interviews', interviewRoutes);
apiRouter.use('/calls', callRoutes);
apiRouter.use('/sync', syncRoutes);
apiRouter.use('/', webhookRoutes);

export default apiRouter;
