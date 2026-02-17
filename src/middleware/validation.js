import { z } from 'zod';
import { AppError } from '../utils/AppError.js';


export const createValidator = (schema) => {
  return async (req, res, next) => {
    try {
      req.validatedData = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const message = error.errors.map(e => e.message).join(', ');
      next(new AppError(message, 400));
    }
  };
};

export const validateRegister = createValidator(
  z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    name: z.string().min(1, 'Name is required').optional(),
    role: z.enum(['student', 'admin', 'teacher']).optional()
  })
);

export const validateLogin = createValidator(
  z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
);

export const validateOtp = createValidator(
  z.object({
    otp: z.string().length(6, 'OTP must be 6 digits')
  })
);

export const validateRefreshToken = createValidator(
  z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
);

export const validateUpdateUser = createValidator(
  z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['student', 'admin', 'teacher']).optional(),
    status: z.enum(['active', 'inactive']).optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
);
