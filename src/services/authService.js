import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { 
  createUserService, 
  findUserByEmail, 
  findUserById, 
  updateUserOtp, 
  verifyUserOtp 
} from './userService.js';
import { sendOtpEmail, generateOTP, OTP_EXPIRY } from '../utils/otp.js';  
import { generateTokens } from '../utils/jwt.js';

export const registerService = async (userData) => {
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
    const user = await createUserService(userData);
    userId = user._id;
    console.log('Setting OTP for new user:', userId);
    await updateUserOtp(userId, otp, expiresAt);
  }

  console.log('Sending OTP email to:', userData.email);
  await sendOtpEmail(userData.email, otp);
  
  return { userId: userId.toString(), message: 'OTP sent to email' };
};

export const verifyOtpService = async (otp) => {
  console.log('Verifying OTP:', otp);
  const user = await verifyUserOtp(otp);
  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const loginService = async (email, password) => {
  console.log('Login attempt for:', email);
  
  const user = await findUserByEmail(email);
  
  console.log('User found:', !!user, 'Status:', user?.status);

  if (!user || user.status !== "active") {
    console.log('Login failed: user inactive or not found');
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('Login failed: invalid password');
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  console.log('Login successful for:', email);

  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const refreshTokenService = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await findUserById(decoded.userId).select('+passwordHash');

    if (!user || user.status !== "active") {
      throw new AppError('Invalid refresh token', 401);
    }

    return generateTokens({ userId: user._id, role: user.role });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
