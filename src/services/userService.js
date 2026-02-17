import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

export const getUsersService = async ({ page = 1, limit = 50, role, status }) => {
  const skip = (page - 1) * limit;
  const filter = { status: "active" };
  
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const createUserService = async (userData) => {
  try {

    const firstName = userData.firstName || 
                     (userData.name?.split(' ')[0] || 'Unknown');
    
    const lastName = userData.lastName || 
                    (userData.name?.includes(' ') 
                     ? userData.name.split(' ').slice(1).join(' ')
                     : 'User');

    // Proper name handling with fallbacks
    const firstName =
      userData.firstName || userData.name?.split(" ")[0] || "Unknown";

    const lastName =
      userData.lastName ||
      (userData.name?.includes(" ")
        ? userData.name.split(" ").slice(1).join(" ")
        : "User");


    const hashedPassword = await hashPassword(userData.password);

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: hashedPassword,

      role: userData.role || "student",
      status: "inactive",
    });

    return await user.save();
  } catch (error) {

    console.error("Create user error:", error.message);

    if (error.code === 11000) {
      throw new AppError("Email already exists", 409);
    }
    throw new AppError("Failed to create user", 500);
  }
};

export const getUserByIdService = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  const user = await User.findById(id).select("-passwordHash");
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const updateUserService = async (id, updates) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }

  if (updates.password) {
    updates.passwordHash = await hashPassword(updates.password);
    delete updates.password;
  }

  const user = await User.findByIdAndUpdate(
    id, 
    updates, 
    { new: true, runValidators: true }
  ).select("-passwordHash");
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const findUserByEmail = async (email) => {

  return User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

  return User.findOne({ email }).select("+passwordHash");

};

export const findUserById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid user ID", 400);
  }

  return User.findById(id);

  return User.findById(id).select("-passwordHash");

};

export const updateUserOtp = async (userId, otp, expiresAt) => {
  if (!isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  return User.findByIdAndUpdate(
    userId,
    { otp: otp.toString(), otpExpiresAt: expiresAt },
    { new: true },
  );
};

export const verifyUserOtp = async (otp) => {
  const user = await User.findOne({
    otp,
    otpExpiresAt: { $gt: new Date() },
  });
  if (!user) return null;

  return User.findByIdAndUpdate(
    user._id,
    {
      $unset: { otp: 1, otpExpiresAt: 1 },
      status: "active",
    },
    { new: true },
  );
};
