import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
 registerUser,
 verifyOtpHandler,
 loginUser,
 refreshAccessToken
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();


const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5,
 message: { success: false, message: 'Too many attempts' },
 standardHeaders: true,
 legacyHeaders: false,
});

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
  if (!otp || otp.length !== 6) return res.status(400).json({ success: false, message: 'Valid 6-digit OTP required' });
  req.validated = { otp };
  return next();
 }

 if (req.path.includes('refresh')) {
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  req.validated = { refreshToken };
  return next();
 }

 next();
};


router.post('/register', authLimiter, simpleValidation, registerUser);
router.post('/verify-otp', authLimiter, simpleValidation, verifyOtpHandler);
router.post('/login', authLimiter, simpleValidation, loginUser);
router.post('/refresh', authLimiter, simpleValidation, refreshAccessToken);

router.get('/profile', authenticateToken, (req, res) => {
 res.json({ success: true, data: req.user });
});

export default router;
