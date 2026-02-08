import { Router } from 'express';
import {
 authLimiter,
 otpLimiter,
 refreshLimiter
} from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validation.js';
import {
 registerUser,
 verifyOtpHandler,
 loginUser,
 refreshAccessToken,
 getProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authLimiter, validateRequest, registerUser);
router.post('/login', authLimiter, validateRequest, loginUser);
router.post('/verify-otp', otpLimiter, validateRequest, verifyOtpHandler);
router.post('/refresh', refreshLimiter, validateRequest, refreshAccessToken);

router.get('/profile', authenticateToken, getProfile);

export default router;
