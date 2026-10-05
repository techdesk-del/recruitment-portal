import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';
import { ensureDBConnected, getMongoConnectionStatus } from '../config/database.js';
import { DEFAULT_USERS } from '../services/userSeeder.js';

// In-memory fallback users in case MongoDB Atlas is unreachable
let memoryUsers = DEFAULT_USERS.map(u => {
  const salt = bcrypt.genSaltSync(10);
  return {
    ...u,
    password: bcrypt.hashSync(u.password, salt),
    status: 'active',
    lastLogin: new Date().toISOString()
  };
});

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = ['admin', 'recruiter', 'hiring_manager'].includes(role) ? role : 'recruiter';
    const userId = `user-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const isConnected = await ensureDBConnected();

    if (isConnected) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const user = new User({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        password,
        role: assignedRole,
        department: department || (assignedRole === 'admin' ? 'Executive' : 'Human Resources'),
        avatar: name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      });

      await user.save();
      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: user.toJSON()
      });
    }

    // In-memory fallback
    const memExisting = memoryUsers.find(u => u.email === cleanEmail);
    if (memExisting) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const memUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: bcrypt.hashSync(password, salt),
      role: assignedRole,
      department: department || 'General',
      avatar: name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
      status: 'active',
      lastLogin: new Date().toISOString()
    };
    memoryUsers.push(memUser);

    const token = generateToken(memUser);
    const safeUser = { ...memUser };
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete registration: ' + err.message });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isConnected = await ensureDBConnected();

    if (isConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Your account has been deactivated. Please contact an Administrator.' });
      }

      user.lastLogin = new Date().toISOString();
      await user.save();

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: user.toJSON()
      });
    }

    // In-memory fallback login
    const memUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!memUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, memUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    memUser.lastLogin = new Date().toISOString();
    const token = generateToken(memUser);
    const safeUser = { ...memUser };
    delete safeUser.password;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
}

// GET /api/auth/me (Returns active verified session)
export async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

// GET /api/auth/users (Admin-only: list all system users)
export async function getUsers(req, res) {
  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json(users);
    }
    const safeMem = memoryUsers.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    return res.json(safeMem);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
}

// PATCH /api/auth/users/:id/role (Admin-only: switch user role)
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'recruiter', 'hiring_manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const updated = await User.findOneAndUpdate(
        { id },
        { role },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json({ success: true, user: updated.toJSON() });
    }

    const idx = memoryUsers.findIndex(u => u.id === id);
    if (idx >= 0) {
      memoryUsers[idx].role = role;
      const safe = { ...memoryUsers[idx] };
      delete safe.password;
      return res.json({ success: true, user: safe });
    }

    return res.status(404).json({ error: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}
