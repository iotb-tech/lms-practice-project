import { z } from 'zod';

export const registerSchema = z.object({
 firstName: z.string().min(2).max(50),
 lastName: z.string().min(2).max(50),
 email: z.string().email(),
 password: z.string().min(8),
 role: z.enum(['student', 'instructor', 'admin']).optional()
});

export const verifyOtpSchema = z.object({
 userId: z.string(),
 otp: z.string().length(6)
});

export const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(8)
});

export const refreshSchema = z.object({
 refreshToken: z.string()
});
