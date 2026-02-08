import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

const schemas = {
 '/register': z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  role: z.enum(['student', 'admin']).default('student'),
 }),
 '/login': z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
 }),
 '/verify-otp': z.object({
  otp: z.string().length(6).regex(/^\d{6}$/),
 }),
 '/refresh': z.object({
  refreshToken: z.string().min(1),
 }),
};

export const validateRequest = (req, res, next) => {
 const schema = schemas[req.path];
 if (!schema) return next();

 const result = schema.safeParse(req.body);
 if (!result.success) {
  const errorMessages = result.error.errors.map(e => e.message);
  throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
 }

 req.validated = result.data;
 next();
};
