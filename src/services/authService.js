import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';  
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserOtp,
  verifyUserOtp
} from './userService.js';
import { sendOtpEmail, generateOTP, OTP_EXPIRY } from '../utils/otp.js';
import { config } from '../config/index.js';
import { generateTokens } from '../utils/jwt.js';

export const register = async (userData) => {
  console.log('Registering user:', userData.email);
  
  const existingUser = await findUserByEmail(userData.email);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);

  let userId;

  if (existingUser) {
    if (existingUser.status === "active") {  
      throw new AppError('Email already registered and active', 409);
    }
    userId = existingUser._id;
    console.log('Updating OTP for existing user:', userId);
    await updateUserOtp(userId, otp, expiresAt);
  } else {
    console.log('Creating new user');
    const user = await createUser(userData);
    userId = user._id;
    console.log('Setting OTP for new user:', userId);
    await updateUserOtp(userId, otp, expiresAt);
  }

  console.log('Sending OTP email to:', userData.email);
  await sendOtpEmail(userData.email, otp);
  
  return { userId: userId.toString(), message: 'OTP sent to email' };
};

export const verifyOtp = async (otp) => {
  console.log('Verifying OTP:', otp);
  const user = await verifyUserOtp(otp);
  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  //  Activate user after OTP verification
  await User.findByIdAndUpdate(user._id, { status: "active" });
  
  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const login = async (email, password) => {
  console.log('Login attempt for:', email);
  
  //  DIRECT MODEL QUERY - bypass ALL service layer issues
  const user = await User.findOne({ email }).select('+passwordHash');
  
  console.log(' User found:', !!user, 'Status:', user?.status);

  // Use status enum from your model
  if (!user || user.status !== "active") {
    console.log('Login failed: user inactive or not found');
    throw new AppError('Invalid credentials', 401);
  }

  //  Use YOUR MODEL'S comparePassword method directly
  const isPasswordValid = await user.comparePassword(password);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('Login failed: invalid password');
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  console.log('Login successful for:', email);

  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const refreshTokenFunc = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.userId).select('+passwordHash');

    if (!user || user.status !== "active") {  
      throw new AppError('Invalid refresh token', 401);
    }

    return generateTokens({ userId: user._id, role: user.role });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
