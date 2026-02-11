import express from "express";
import User from '../models/User.js';                    
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validateCreateUser, validateUpdateUser } from '../middleware/validation.js';
import bcrypt from 'bcryptjs';

const router = express.Router(); 


const ROLE_PERMISSIONS = {
  student: [],
  instructor: ['view_profile'],
  admin: ['*', 'view_users', 'create_users', 'update_users', 'delete_users']
};

const authorizeRole = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = userPermissions.includes("*") || 
                         userPermissions.includes(requiredPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false,
        message: "You do not have permission to perform this action" 
      });
    }
    next();
  };
};


const canAccessUser = () => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAdminAccess = userPermissions.includes("*") || userPermissions.includes("view_users");
    
    if (req.user.id === req.params.id || hasAdminAccess) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: "You do not have permission to access this user" 
    });
  };
};

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

// GET /api/v1/users - Admin only
router.get("/", 
  authenticateToken, 
  authorizeRole("view_users"), 
  async (req, res) => {
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
  }
);

// POST /api/v1/users - Admin only
router.post("/", 
  authenticateToken, 
  authorizeRole("create_users"), 
  validateCreateUser, 
  async (req, res) => {
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
  }
);

// GET /api/v1/users/:id - Self or Admin
router.get("/:id", 
  authenticateToken, 
  canAccessUser(),
  async (req, res) => {
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
  }
);

// PATCH /api/v1/users/:id - Self or Admin
router.patch("/:id", 
  authenticateToken, 
  canAccessUser(),
  validateUpdateUser,
  async (req, res) => {
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
  }
);

export default router;  
