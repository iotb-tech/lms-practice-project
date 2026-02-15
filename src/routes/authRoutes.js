import { Router } from 'express';
import {
  validateRegister,
  validateLogin,
  createValidator,
  validateOtp
} from '../middleware/validation.js';
import { 
  registerUser, 
  loginUser,
  verifyOtpHandler,
  getProfile 
} from '../controllers/authController.js';
import { z } from 'zod';




const router = Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-otp', validateOtp, verifyOtpHandler);

router.get('/profile', getProfile);  
export default router;