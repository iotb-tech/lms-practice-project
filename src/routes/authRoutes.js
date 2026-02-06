import express from 'express';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { validateLogin, validateRefresh, handleValidation } from '../middleware/validation.js';
import { login, refreshToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login',
 authRateLimiter,
 validateLogin,
 handleValidation,
 login
);

router.post('/refresh',
 validateRefresh,
 handleValidation,
 refreshToken
);

router.post('/logout',
 authenticateToken,
 logout
);

export default router;
