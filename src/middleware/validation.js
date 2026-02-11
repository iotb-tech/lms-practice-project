import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  name: z.string().min(1, 'Name required').optional()
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be 6+ chars')
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50),
  lastName: z.string().min(1, 'Last name required').max(50),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be 8+ chars'),
  role: z.enum(["student", "instructor", "admin"]).optional()
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50).optional(),
  lastName: z.string().min(1, 'Last name required').max(50).optional(),
  avatarUrl: z.string().url('Valid URL required').optional(),
  status: z.enum(["active", "inactive"]).optional()
});

export const createValidator = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body || {});
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const issues = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.code === 'invalid_type' && issue.received === 'undefined'
            ? `${issue.path.join('.')} is required`
            : issue.message.replace('Invalid input: ', '').replace('expected string, received undefined', 'is required')
        }));
        
        throw new AppError('Validation failed', 400, { errors: issues });
      }
      
      throw new AppError('Validation failed', 400, { 
        errors: [{ path: '', message: error.message || 'Invalid input' }]
      });
    }
  };
};

export const validateRegister = createValidator(registerSchema);
export const validateLogin = createValidator(loginSchema);
export const validateCreateUser = createValidator(createUserSchema);
export const validateUpdateUser = createValidator(updateUserSchema);
