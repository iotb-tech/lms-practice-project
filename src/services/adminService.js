import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

export const createSuperAdmin = async (userData) => {
  console.log('Creating super admin:', userData.email);
  
  // Check if super admin already exists
  const existingAdmin = await User.findOne({ 
    email: userData.email,
    isSuperAdmin: true 
  });

  if (existingAdmin) {
    throw new AppError('Super admin with this email already exists', 409);
  }

  // Check if regular user exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  // Generate unique API key (64 chars)
  const adminApiKey = crypto.randomBytes(32).toString('hex');

  // Create super admin
  const superAdmin = new User({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    passwordHash,
    role: 'admin',
    isSuperAdmin: true,
    adminApiKey,
    status: 'active'
  });

  await superAdmin.save();
  
  // Return safe data WITH API key (only for creation)
  const safeAdmin = superAdmin.toObject();
  delete safeAdmin.passwordHash;
  
  return {
    ...safeAdmin,
    adminApiKey,
    message: 'Super admin created successfully'
  };
};

export const regenerateAdminApiKey = async (adminId) => {
  const admin = await User.findOne({ 
    _id: adminId, 
    isSuperAdmin: true 
  }).select('+adminApiKey');

  if (!admin) {
    throw new AppError('Super admin not found', 404);
  }

  // Generate new API key
  const newApiKey = crypto.randomBytes(32).toString('hex');
  admin.adminApiKey = newApiKey;
  await admin.save();

  return { 
    adminApiKey: newApiKey,
    message: 'API key regenerated successfully'
  };
};

export const listAllUsers = async () => {
  const users = await User.find({})
    .select('-passwordHash -adminApiKey -otp')
    .sort({ createdAt: -1 });
  
  return users;
};
