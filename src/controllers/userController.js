import { 
  getUsersService, 
  createUserService, 
  getUserByIdService, 
  updateUserService,
  deleteUserService 
} from '../services/userService.js';

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

export const createUser = async (req, res, next) => {
  try {
    const userData = req.validatedData;
    const user = await createUserService(userData);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
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

export const deleteUser = async (req, res, next) => {
  try {
    await deleteUserService(req.params.id);
    res.json({
      success: true,
      message: "User deactivated successfully"
    });
  } catch (error) {
    next(error);
  }
};
