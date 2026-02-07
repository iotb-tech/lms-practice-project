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
} from '../middleware/auth.js';
import { validate } from '../middleware/validation.js'; // Assume Zod/Joi middleware
import {
 registerSchema,
 verifyOtpSchema,
 loginSchema,
 refreshSchema
} from '../validations/authValidation.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);           // POST /api/auth/register
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtpHandler);  // POST /api/auth/verify-otp
router.post('/login', validate(loginSchema), loginUser);                  // POST /api/auth/login
router.post('/refresh', validate(refreshSchema), refreshAccessToken);     // POST /api/auth/refresh

// Protected profile routes 
router.get('/profile', authenticateToken, async (req, res) => {
 res.json({
  success: true,
  data: req.user
 });
});

router.patch('/profile',
 authenticateToken,
 validate(updateProfileSchema),
 async (req, res) => {
  // Update profile logic
 }
);

// Admin-only routes
router.get('/users',
 authenticateToken,
 authorizeRoles('admin'),
 async (req, res) => {
  // List users logic
 }
);

export default router;
