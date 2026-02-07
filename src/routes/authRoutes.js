import { Router } from 'express';
import {
 registerUser,
 verifyOtpHandler,
 loginUser,
 refreshAccessToken
} from '../controllers/authController.js';
import {
 authenticateToken,
 authorizeRoles
} from '../middleware/authMiddleware.js';

// Simple inline validation - NO external files needed
const simpleValidation = (req, res, next) => {
 const { firstName, lastName, email, password, role, userId, otp, refreshToken } = req.body;

 if (req.path.includes('register')) {
  if (!firstName?.trim() || firstName.length < 2) return res.status(400).json({ success: false, message: 'First name required' });
  if (!lastName?.trim() || lastName.length < 2) return res.status(400).json({ success: false, message: 'Last name required' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Valid email required' });
  if (!password || password.length < 8) return res.status(400).json({ success: false, message: 'Password minimum 8 characters' });
  req.validated = { firstName: firstName.trim(), lastName: lastName.trim(), email, password, role: role || 'student' };
  return next();
 }

 if (req.path.includes('login')) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Valid email required' });
  if (!password || password.length < 8) return res.status(400).json({ success: false, message: 'Password required' });
  req.validated = { email, password };
  return next();
 }

 if (req.path.includes('verify-otp')) {
  if (!userId || !otp || otp.length !== 6) return res.status(400).json({ success: false, message: 'Valid userId and 6-digit OTP required' });
  req.validated = { userId, otp };
  return next();
 }

 if (req.path.includes('refresh')) {
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  req.validated = { refreshToken };
  return next();
 }

 next();
};

const router = Router();

router.post('/register', simpleValidation, registerUser);
router.post('/verify-otp', simpleValidation, verifyOtpHandler);
router.post('/login', simpleValidation, loginUser);
router.post('/refresh', simpleValidation, refreshAccessToken);

router.get('/profile', authenticateToken, (req, res) => {
 res.json({ success: true, data: req.user });
});

export default router;
