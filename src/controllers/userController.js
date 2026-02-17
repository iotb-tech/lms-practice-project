import { getUsersService, getUserByIdService, updateUserService } from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const result = await getUsersService(req.query);
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updates = req.validatedData;
    const user = await updateUserService(req.params.id, updates);
    
    res.json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
