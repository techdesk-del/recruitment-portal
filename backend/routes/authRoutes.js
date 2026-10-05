import { Router } from 'express';
import { register, login, getMe, getUsers, updateUserRole } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authenticated session route
router.get('/me', requireAuth, getMe);

// Admin-only management routes
router.get('/users', requireAuth, requireRole('admin'), getUsers);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), updateUserRole);

export default router;
