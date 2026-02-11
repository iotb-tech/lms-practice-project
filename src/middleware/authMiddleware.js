
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';
import { config } from '../config/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.userId).select('-passwordHash'); 
    if (!user || user.status !== "active") { 
      throw new AppError('Invalid or inactive user token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
