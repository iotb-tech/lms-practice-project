import express from "express";
import { 
  getUsers, 
  getUserById, 
  updateUser 
} from '../controllers/userController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validateUpdateUser } from '../middleware/validation.js';
import { authorizeRole, canAccessUser } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", 
  authenticateToken, 
  authorizeRole("view_users"), 
  getUsers
);

router.get("/:id", 
  authenticateToken, 
  canAccessUser(),
  getUserById
);

router.patch("/:id", 
  authenticateToken, 
  canAccessUser(),
  validateUpdateUser,
  updateUser
);

export default router;
