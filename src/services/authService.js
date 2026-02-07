import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateTokens } from '../utils/jwt.js';
import { generateOTP } from '../utils/otp.js';
import { createUser, findUserByEmail, findUserById, updateUserOtp, verifyUserOtp } from './userService.js';
import jwt from 'jsonwebtoken';

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const register = async (userData) => {
 const existingUser = await findUserByEmail(userData.email);
 if (existingUser) {
  if (existingUser.isActive) {
   throw new Error('Email already exists');
  }
  // Reactivate existing user
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);
  await updateUserOtp(existingUser._id, otp, expiresAt);
  return { userId: existingUser._id, otp };
 }

 const user = await createUser(userData);
 const otp = generateOTP();
 const expiresAt = new Date(Date.now() + OTP_EXPIRY);
 await updateUserOtp(user._id, otp, expiresAt);
 return { userId: user._id, otp };
};

export const verifyOtp = async (userId, otp) => {
 const user = await verifyUserOtp(userId, otp);
 if (!user) {
  throw new Error('Invalid or expired OTP');
 }
 const payload = { userId: user._id, role: user.role };
 return generateTokens(payload);
};

export const login = async (email, password) => {
 const user = await findUserByEmail(email);
 if (!user || !user.isActive || !(await comparePassword(password, user.password))) {
  throw new Error('Invalid credentials');
 }
 const payload = { userId: user._id, role: user.role };
 return generateTokens(payload);
};

export const refreshToken = async (refreshToken) => {
 const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
 const user = await findUserById(decoded.userId);
 if (!user) throw new Error('Invalid refresh token');
 return generateTokens({ userId: user._id, role: user.role });
};
