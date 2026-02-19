import { getRolesService } from '../services/roleService.js';

export const getRoles = async (req, res, next) => {
  try {
    const roles = await getRolesService();
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};
