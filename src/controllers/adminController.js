import { createSuperAdmin, regenerateAdminApiKey, listAllUsers } from '../services/adminService.js';

export const createSuperAdminHandler = async (req, res, next) => {
  try {
    // ✅ Use req.body directly (fixes undefined error)
    const admin = await createSuperAdmin(req.body);
    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateApiKeyHandler = async (req, res, next) => {
  try {
    const result = await regenerateAdminApiKey(req.admin._id);
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const listUsersHandler = async (req, res, next) => {
  try {
    const users = await listAllUsers();
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users, count: users.length }
    });
  } catch (error) {
    next(error);
  }
};
