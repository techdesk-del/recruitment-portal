import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { ensureDBConnected } from '../config/database.js';

// Authentication Middleware: verifies JWT token
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized: No token provided. Please log in.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    let user = null;
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      user = await User.findOne({ id: decoded.id });
    }
    
    if (!user) {
      // Fallback for token-encoded active session
      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
        status: 'active'
      };
    }

    if (user.status === 'inactive') {
      return res.status(401).json({ 
        error: 'Unauthorized: User account has been deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

// Role-Based Access Control (RBAC) Middleware: verifies user role
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access denied for role '${req.user.role}'. Required: ${allowedRoles.join(' or ')}.` 
      });
    }

    next();
  };
}
