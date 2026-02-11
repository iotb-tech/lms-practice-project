import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createUser = async (userData) => {
  try {
    // Proper name handling with fallbacks
    const firstName = userData.firstName || 
                     (userData.name?.split(' ')[0] || 'Unknown');
    
    const lastName = userData.lastName || 
                    (userData.name?.includes(' ') 
                     ? userData.name.split(' ').slice(1).join(' ')
                     : 'User');

    // Hash BEFORE passing to model
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(userData.password, 12, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: hashedPassword,  
      
      role: userData.role || "student",
      status: "inactive"
    });
    
    return await user.save();
  } catch (error) {
    console.error('Create user error:', error.message);
    if (error.code === 11000) {
      throw new AppError('Email already exists', 409);
    }
    throw new AppError('Failed to create user', 500);
  }
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email }).select('+passwordHash');
};

export const findUserById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }
  return User.findById(id).select('-passwordHash');
};

export const updateUserOtp = async (userId, otp, expiresAt) => {
  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  return User.findByIdAndUpdate(
    userId,
    { otp: otp.toString(), otpExpiresAt: expiresAt },
    { new: true }
  );
};

export const verifyUserOtp = async (otp) => {
  const user = await User.findOne({
    otp,
    otpExpiresAt: { $gt: new Date() }
  });
  if (!user) return null;

  return User.findByIdAndUpdate(
    user._id,
    { 
      $unset: { otp: 1, otpExpiresAt: 1 },
      status: "active"
    },
    { new: true }
  );
};
