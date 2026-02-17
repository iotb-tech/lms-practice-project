import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status } = req.query;
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

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users' 
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const userData = req.validatedData;
    const hashedPassword = await hashPassword(userData.password);
    
    const user = new User({
      ...userData,
      passwordHash: hashedPassword,
      status: "active"
    });
    
    await user.save();
    const safeUser = await User.findById(user._id).select("-passwordHash");
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        error: "Email already exists" 
      });
    }
    res.status(500).json({ 
      success: false,
      error: "Failed to create user" 
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch user" 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = req.validatedData;
    
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    ).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    res.json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
};
