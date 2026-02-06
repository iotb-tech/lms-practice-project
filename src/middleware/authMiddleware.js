import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { logWarn } from '../utils/logger.js';
import { config } from '../config/index.js';

export const authenticateToken = async (req, res, next) => {
 try {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
   return next(new AppError('Access token required', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
   return next(new AppError('Access token required', 401));
  }

  const decoded = jwt.verify(token, config.jwt.accessSecret);
  const user = await User.findById(decoded.userId).select('status role');

  if (!user || user.status !== 'active') {
   return next(new AppError('Invalid token or inactive user', 401));
  }

  req.user = {
   id: user._id.toString(),
   role: user.role,
   email: user.email
  };
  next();
 } catch (error) {
  logWarn('Token verification failed', {
   url: req.originalUrl,
   method: req.method
  });
  next(new AppError('Invalid or expired token', 401));
 }
};

export const requireRole = (...roles) => (req, res, next) => {
 if (!req.user || !roles.includes(req.user.role)) {
  return next(new AppError('Insufficient permissions', 403));
 }
 next();
};

// Role hierarchy check
export const requireHigherRole = (minRole) => (req, res, next) => {
 const roleHierarchy = { USER: 1, MERCHANT: 2, ADMIN: 3 };
 if (!req.user || roleHierarchy[req.user.role] <= roleHierarchy[minRole]) {
  return next(new AppError('Insufficient permissions', 403));
 }
 next();
};
