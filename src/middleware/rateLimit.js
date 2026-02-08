import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const createLimiter = (max, message) => rateLimit({
 windowMs: config.rateLimit.windowMs,
 max,
 message: { success: false, message },
 standardHeaders: true,
 legacyHeaders: false,
});

export const authLimiter = createLimiter(5, 'Too many authentication attempts. Try again later.');
export const otpLimiter = createLimiter(3, 'Too many OTP attempts. Try again later.');
export const refreshLimiter = createLimiter(10, 'Too many refresh attempts. Try again later.');
