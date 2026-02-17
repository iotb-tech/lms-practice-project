import express from "express";
import { 
  getUsers, 
  createUser, 
  getUserById, 
  updateUser 
} from '../controllers/userController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validateCreateUser, validateUpdateUser } from '../middleware/validation.js';
import { authorizeRole, canAccessUser } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", 
  authenticateToken, 
  authorizeRole("view_users"), 
  getUsers
);

router.post("/", 
  authenticateToken, 
  authorizeRole("create_users"), 
  validateCreateUser, 
  createUser
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
