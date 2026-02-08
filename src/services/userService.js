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

export const verifyUserOtp = async (otp) => {

 const user = await User.findOne({
  otp,
  otpExpiresAt: { $gt: new Date() }
 }).select('otp otpExpiresAt isActive');

 console.log(' DEBUG:', {
  otp,
  foundUserId: user?._id,
  storedOtp: user?.otp,
  expires: user?.otpExpiresAt
 });

 if (!user) {
  return null;
 }
 await User.findByIdAndUpdate(user._id, {
  $unset: { otp: 1, otpExpiresAt: 1 },
  isActive: true
 });

 return user;
};