import User from '../models/User.js';
import { hashPassword } from '../utils/hash.js';


export const createUser = async (userData) => {
 const hashedPassword = await hashPassword(userData.password);
 const user = await User.create({
  ...userData,
  password: hashedPassword,
  isActive: false
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

 console.log('🔍 DEBUG:', { userId, otp, storedOtp: user?.otp, expires: user?.otpExpiresAt });

 if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
  return null;
 }

 await User.findByIdAndUpdate(userId, {
  $unset: { otp: 1, otpExpiresAt: 1 },
  isActive: true
 });

 return user;
};
