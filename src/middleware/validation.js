import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const validateRefresh = [
  // Refresh token validation handled by middleware, just ensure request body is valid
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string')
];

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
  }
  next();
};
