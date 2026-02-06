import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { logWarn, logInfo } from '../utils/logger.js';
import { config } from '../config/index.js';
import RefreshToken from '../models/RefreshToken.js'; // New model for token rotation

export class AuthService {
 static generateTokens(payload) {
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
   expiresIn: config.jwt.accessExpiry || '15m'
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
   expiresIn: config.jwt.refreshExpiry || '7d'
  });

  return { accessToken, refreshToken };
 }

 static async login(email, password) {
  const user = await User.findOne({ email }).select('+password');

  if (!user || user.status !== 'active' || !(await user.comparePassword(password))) {
   logWarn('Failed login attempt', { email });
   throw new AppError('Invalid credentials', 401);
  }

  // Delete any existing refresh tokens for this user (single session)
  await RefreshToken.deleteMany({ userId: user._id });

  const tokens = this.generateTokens({
   userId: user._id.toString(),
   role: user.role
  });

  // Store refresh token for rotation
  await RefreshToken.create({
   token: tokens.refreshToken,
   userId: user._id,
   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  logInfo('User logged in', { userId: user.id, email: user.email });

  return {
   user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
   },
   tokens
  };
 }

 static async refreshToken(token) {
  // Verify token
  const decoded = jwt.verify(token, config.jwt.refreshSecret);

  // Check if token exists and not used
  const refreshTokenDoc = await RefreshToken.findOne({
   token,
   userId: decoded.userId
  });

  if (!refreshTokenDoc) {
   throw new AppError('Invalid refresh token', 403);
  }

  const user = await User.findById(decoded.userId).select('status role');
  if (!user || user.status !== 'active') {
   await RefreshToken.deleteOne({ token });
   throw new AppError('User inactive', 403);
  }

  // Delete old token (rotation)
  await RefreshToken.deleteOne({ token });

  // Generate new tokens
  const newTokens = this.generateTokens({
   userId: user._id.toString(),
   role: user.role
  });

  // Store new refresh token
  await RefreshToken.create({
   token: newTokens.refreshToken,
   userId: user._id,
   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  logInfo('Tokens refreshed', { userId: user.id });
  return newTokens;
 }
}
