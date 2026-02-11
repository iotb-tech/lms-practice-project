export const authorizeRole = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    
    const hasPermission = userPermissions.includes("*") || 
                         userPermissions.includes(requiredPermission);
    
    if (!hasPermission) {
      console.log(` ${req.user.role} missing permission: ${requiredPermission}`);
      return res.status(403).json({ 
        message: "You do not have permission to perform this action" 
      });
    }
    
    next();
  };
};
