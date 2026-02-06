import { AuthService } from '../services/authService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logInfo } from '../utils/logger.js';

export const login = asyncHandler(async (req, res) => {
 const { email, password } = req.body;
 const { user, tokens } = await AuthService.login(email, password);

 // Secure refresh token cookie with rotation support
 res.cookie('refreshToken', tokens.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
 });

 logInfo('User logged in successfully', { userId: user.id, email: user.email });

 res.status(200).json({
  success: true,
  data: {
   user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
   },
   accessToken: tokens.accessToken
  }
 });
});

export const refreshToken = asyncHandler(async (req, res) => {
 const refreshToken = req.cookies.refreshToken;
 if (!refreshToken) {
  const error = new Error('Refresh token required');
  error.statusCode = 401;
  throw error;
 }

 const tokens = await AuthService.refreshToken(refreshToken);

 // Rotate refresh token (new token issued, old one invalidated)
 res.cookie('refreshToken', tokens.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
 });

 res.status(200).json({
  success: true,
  data: { accessToken: tokens.accessToken }
 });
});

export const logout = asyncHandler(async (req, res) => {
 // Clear refresh token cookie
 res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
 });

 res.status(200).json({
  success: true,
  message: 'Logged out successfully'
 });
});
