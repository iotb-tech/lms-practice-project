import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
 try {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
   throw new AppError('Access token required', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user || !user.isActive) {
   throw new AppError('Invalid token', 401);
  }

  req.user = user;
  next();
 } catch (error) {
  next(error);
 }
};
