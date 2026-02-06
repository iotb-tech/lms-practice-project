import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { logInfo } from '../utils/logger.js';

export class UserService {
 static async createUser(data) {
  const existingUser = await User.findOne({
   email: data.email.toLowerCase().trim()
  });

  if (existingUser) {
   throw new AppError('User already exists', 409);
  }

  const user = new User({
   ...data,
   email: data.email.toLowerCase().trim(),
   status: 'active'
  });

  await user.save();
  logInfo('User created', { userId: user.id, email: user.email });

  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
 }

 static async getUsers(filters = {}) {
  const query = {
   status: 'active',
   ...filters,
   email: { $regex: filters.email || '', $options: 'i' }
  };

  const users = await User.find(query)
   .select('-password')
   .sort({ createdAt: -1 })
   .limit(50);

  return users.map(user => user.toJSON());
 }

 static async getUserById(id, requester) {
  const user = await User.findById(id).select('-password');
  if (!user) {
   throw new AppError('User not found', 404);
  }

  // Authorization: self or admin only
  if (requester.id !== id.toString() && requester.role !== 'ADMIN') {
   throw new AppError('Insufficient permissions', 403);
  }

  return user.toJSON();
 }

 static async updateUser(id, data, requester) {
  const user = await User.findById(id);
  if (!user) {
   throw new AppError('User not found', 404);
  }

  // Authorization check
  if (requester.id !== id.toString() && requester.role !== 'ADMIN') {
   throw new AppError('Insufficient permissions', 403);
  }

  // Update fields
  Object.assign(user, data);
  await user.save();

  const { password, ...updatedUser } = user.toObject();
  logInfo('User updated', { userId: id, updatedBy: requester.id });

  return updatedUser;
 }
}
