import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import jobRoutes from './jobRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import callRoutes from './callRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import syncRoutes from './syncRoutes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/candidates', candidateRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/interviews', interviewRoutes);
apiRouter.use('/calls', callRoutes);
apiRouter.use('/sync', syncRoutes);
apiRouter.use('/', webhookRoutes);

export default apiRouter;
