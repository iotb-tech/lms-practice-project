import { ROLE_PERMISSIONS } from "../config/permissions.js";

export const authorizeRole = (requiredPermission) => {
  return (req, res, next) => {
    const { role } = req.user;
    const permissions = ROLE_PERMISSIONS[role];

    if (!role) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Admin shortcut
    if (permissions.includes("*")) {
      return next();
    }

    if (!permissions || !permissions.includes(requiredPermission)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};
