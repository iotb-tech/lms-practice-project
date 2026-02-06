import { logError } from './logger.js';

export const globalErrorHandler = (err, req, res, next) => {
 // Log full error details
 logError(err.message, {
  stack: err.stack,
  url: req.originalUrl,
  method: req.method,
  user: req.user?.id || 'anonymous'
 });

 // Handle AppError (custom operational errors)
 if (err.name === 'AppError' || err.isOperational) {
  return res.status(err.statusCode || 400).json({
   success: false,
   message: err.message,
   ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
 }

 // Handle validation errors
 if (err.name === 'ValidationError') {
  return res.status(400).json({
   success: false,
   message: 'Invalid input data'
  });
 }

 // Generic server error
 res.status(500).json({
  success: false,
  message: 'Internal server error'
 });
};
