
import { ROLE_PERMISSIONS } from '../config/permissions.js';

export const authorizeRole = (requiredPermission) => {
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
