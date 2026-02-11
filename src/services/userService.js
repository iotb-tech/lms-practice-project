import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

//Use correct mongoose method
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      isActive: false,
    });
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Email already exists', 409);
    }
    if (error.name === 'ValidationError') {
      throw new AppError('Invalid user data', 400);
    }
    throw new AppError('Failed to create user', 500);
  }
};

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email }).select('+password');
  } catch (error) {
    throw new AppError('Database error', 500);
  }
};

export const findUserById = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      throw new AppError('Invalid user ID', 400);
    }
    return await User.findById(id).select('-password -otp -otpExpiresAt');
  } catch (error) {
    if (error.name === 'CastError') {
      throw new AppError('Invalid user ID', 400);
    }
    throw error;
  }
};


export const updateUserOtp = async (userId, otp, expiresAt) => {
  try {
    if (!isValidObjectId(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        otp: otp.toString(),
        otpExpiresAt: expiresAt 
      },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('OTP updated for:', userId);
    return updatedUser;
  } catch (error) {
    console.error(' updateUserOtp failed:', error.message);
    if (error.name === 'CastError') {
      throw new AppError('Invalid user ID', 400);
    }
    if (error.name === 'ValidationError') {
      throw new AppError(`Schema validation failed: ${error.message}`, 400);
    }
    throw new AppError(`Failed to update OTP: ${error.message}`, 500);
  }
};

export const verifyUserOtp = async (otp) => {
  try {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new AppError('Invalid OTP format', 400);
    }

    const user = await User.findOne({
      otp,
      otpExpiresAt: { $gt: new Date() },
    }).select('_id role isActive otp otpExpiresAt');

    if (!user) {
      return null;
    }

    return await User.findByIdAndUpdate(
      user._id,
      {
        $unset: { otp: 1, otpExpiresAt: 1 },
        isActive: true,
      },
      { new: true }
    );
  } catch (error) {
    throw new AppError('OTP verification failed', 500);
  }
};
