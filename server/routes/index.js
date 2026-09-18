import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import syncRoutes from './syncRoutes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/candidates', candidateRoutes);
apiRouter.use('/', webhookRoutes);
apiRouter.use('/sync', syncRoutes);

export default apiRouter;
