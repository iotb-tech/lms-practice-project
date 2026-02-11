import { Router } from 'express';
import {
  validateRegister,
  validateLogin,
  createValidator
} from '../middleware/validation.js';
import { 
  registerUser, 
  loginUser,
  verifyOtpHandler,
  getProfile 
} from '../controllers/authController.js';
import { z } from 'zod';


const otpSchema = z.object({
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(6, 'OTP must be at most 6 digits')
});
const validateOtp = createValidator(otpSchema);

const router = Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-otp', validateOtp, verifyOtpHandler);

router.get('/profile', getProfile);  
export default router;
