import { logError } from './logger.js';
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (err, req, res, next) => {
 // Log full error details
 logError(err.message, {
  stack: err.stack,
  url: req.originalUrl,
  method: req.method,
  userId: req.user?._id || 'anonymous'
 });

 // AppError (custom errors)
 if (err instanceof AppError) {
  return res.status(err.statusCode).json({
   success: false,
   message: err.message,
   ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
 }

 // Zod validation errors
 if (err.name === 'ZodError') {
  return res.status(400).json({
   success: false,
   message: 'Validation failed',
   errors: err.errors.map(e => e.message)
  });
 }

 // Mongoose validation
 if (err.name === 'ValidationError') {
  return res.status(400).json({
   success: false,
   message: 'Invalid input data',
   errors: Object.values(err.errors).map(val => val.message)
  });
 }

 // MongoDB duplicate key
 if (err.code === 11000) {
  return res.status(400).json({
   success: false,
   message: 'Email already exists'
  });
 }

 // JWT errors
 if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
  return res.status(401).json({
   success: false,
   message: 'Invalid token'
  });
 }

 // Generic server error
 res.status(500).json({
  success: false,
  message: 'Internal server error'
 });
};
