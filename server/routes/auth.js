import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unicard_editorial_jwt_secret_key_2026_super_secure';
const COOKIE_NAME = 'unicard_token';

// Helper to set HTTP-only auth cookie
const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const trimmedName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!trimmedName) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    // Duplicate email protection
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User record
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: cleanEmail,
        passwordHash
      }
    });

    // Sign JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Set secure HTTP-only cookie
    setAuthCookie(res, token);

    // Return user payload without password hash
    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Registration error details:', err);
    return res.status(500).json({ error: err.message || 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Find User
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    // Generic invalid credential handling
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Set secure HTTP-only cookie
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: 'Successfully logged out.' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
