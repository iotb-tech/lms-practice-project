import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
 try {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
   return res.status(401).json({
    success: false,
    status: 'error',
    message: 'Access token required'
   });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user || !user.isActive) {
   return res.status(401).json({
    success: false,
    status: 'error',
    message: 'Invalid token'
   });
  }

  req.user = user;
  next();
 } catch (error) {
  res.status(403).json({
   success: false,
   status: 'error',
   message: 'Invalid token'
  });
 }
};

export const authorizeRoles = (...roles) => {
 return (req, res, next) => {
  if (!roles.includes(req.user.role)) {
   return res.status(403).json({
    success: false,
    status: 'error',
    message: `Role ${req.user.role} not authorized`
   });
  }
  next();
 };
};
