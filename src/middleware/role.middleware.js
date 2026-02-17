import { ROLE_PERMISSIONS } from "../config/permissions.js";
import { AppError } from "../utils/AppError.js";

export const authorizeRole = (requiredPermission) => {
  return (req, res, next) => {
    const { role } = req.user;
    const permissions = ROLE_PERMISSIONS[role];

    if (!role) {
      throw new AppError("Access denied", 403);
    }

    // Admin shortcut
    if (permissions.includes("*")) {
      return next();
    }

    if (!permissions || !permissions.includes(requiredPermission)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
};

export const canAccessUser = () => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAdminAccess = userPermissions.includes("*") || 
                          userPermissions.includes("view_users");
    
    if (req.user.id === req.params.id || hasAdminAccess) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: "You do not have permission to access this user" 
    });
  };
};
