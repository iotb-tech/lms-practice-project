import User from '../models/User.js';
import { hashPassword } from '../utils/hash.js';
import { generateOTP } from '../utils/otp.js';

export const createUser = async (userData) => {
 const hashedPassword = await hashPassword(userData.password);
 const user = await User.create({
  ...userData,
  password: hashedPassword
 });
 return user;
};

export const findUserByEmail = async (email) => {
 return User.findOne({ email }).select('+password');
};

export const findUserById = async (id) => {
 return User.findById(id).select('-password');
};

export const updateUserOtp = async (userId, otp, expiresAt) => {
 return User.findByIdAndUpdate(
  userId,
  { otp, otpExpiresAt: expiresAt },
  { new: true }
 );
};

export const verifyUserOtp = async (userId, otp) => {
 const user = await User.findById(userId).select('otp otpExpiresAt isActive');
 if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
  return null;
 }
 await User.findByIdAndUpdate(userId, {
  $unset: { otp: '', otpExpiresAt: '' },
  isActive: true
 });
 return user;
};
