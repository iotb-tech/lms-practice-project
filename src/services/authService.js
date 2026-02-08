import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserOtp,
  verifyUserOtp
} from './userService.js';
import { sendOtpEmail, generateOTP, OTP_EXPIRY } from '../utils/otp.js';
import { comparePassword } from '../utils/hash.js';
import { config } from '../config/index.js';
import { generateTokens } from '../utils/jwt.js';

export const register = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);

  let userId;

  if (existingUser) {
    if (existingUser.isActive) {
      throw new AppError('Email already registered and active', 409);
    }
    userId = existingUser._id;
    await updateUserOtp(userId, otp, expiresAt);
  } else {
    const user = await createUser(userData);
    userId = user._id;
    await updateUserOtp(userId, otp, expiresAt);
  }

  await sendOtpEmail(userData.email, otp);
  return { userId: userId.toString() };
};

export const verifyOtp = async (otp) => {
  const user = await verifyUserOtp(otp);
  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const login = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user || !user.isActive || !(await comparePassword(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const refreshTokenFunc = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await findUserById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    return generateTokens({ userId: user._id, role: user.role });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
