import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const adminApiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-admin-api-key'];
    
    if (!apiKey) {
      throw new AppError('Admin API key required', 401);
    }

    const admin = await User.findOne({ 
      adminApiKey: apiKey, 
      isSuperAdmin: true,
      status: 'active' 
    });

    if (!admin) {
      throw new AppError('Invalid admin API key', 403);
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
