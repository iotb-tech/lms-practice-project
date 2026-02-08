import User from '../models/User.js';
import { hashPassword } from '../utils/hash.js';
import { AppError } from '../utils/AppError.js';

export const createUser = async (userData) => {
 try {
  const hashedPassword = await hashPassword(userData.password);
  const user = await User.create({
   ...userData,
   password: hashedPassword,
   isActive: false
  });
  return user;
 } catch (error) {
  // MongoDB duplicate key error (email unique)
  if (error.code === 11000) {
   throw new AppError('Email already exists', 400);
  }
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
   throw new AppError('Invalid user data', 400);
  }
  throw error;  // Re-throw unexpected errors
 }
};

export const findUserByEmail = async (email) => {
 try {
  return User.findOne({ email }).select('+password');
 } catch (error) {
  throw new AppError('Database error', 500);
 }
};

export const findUserById = async (id) => {
 try {
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
   throw new AppError('Invalid user ID', 400);
  }
  return User.findById(id).select('-password');
 } catch (error) {
  if (error.name === 'CastError') {
   throw new AppError('Invalid user ID', 400);
  }
  throw error;
 }
};

export const updateUserOtp = async (userId, otp, expiresAt) => {
 try {
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
   throw new AppError('Invalid user ID', 400);
  }
  return User.findByIdAndUpdate(
   userId,
   { otp, otpExpiresAt: expiresAt },
   { new: true }
  );
 } catch (error) {
  if (error.name === 'CastError') {
   throw new AppError('Invalid user ID', 400);
  }
  throw new AppError('Failed to update OTP', 500);
 }
};

export const verifyUserOtp = async (otp) => {
 try {
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
   throw new AppError('Invalid OTP format', 400);
  }

  const user = await User.findOne({
   otp,
   otpExpiresAt: { $gt: new Date() }
  }).select('otp otpExpiresAt isActive');

  console.log('DEBUG:', {
   otp,
   foundUserId: user?._id,
   storedOtp: user?.otp,
   expires: user?.otpExpiresAt
  });

  if (!user) {
   return null;
  }

  const updated = await User.findByIdAndUpdate(
   user._id,
   {
    $unset: { otp: 1, otpExpiresAt: 1 },
    isActive: true
   },
   { new: true }
  );

  return updated || user;
 } catch (error) {
  if (error.name === 'CastError') {
   throw new AppError('Database error', 500);
  }
  throw error;
 }
};
