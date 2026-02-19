import express from "express";
import { 
  getUsers, 
  createUser,
  getUserById, 
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { 
  validateRegister,      // ✅ Your Zod validator (works for create)
  validateUpdateUser     // ✅ Your Zod validator
} from '../middleware/validation.js'; 
import { 
  authorizeRole, 
  canAccessUser 
} from "../middleware/role.middleware.js";

const router = express.Router();

// GET /users (Admin) – list users with filters
router.get("/", 
  authenticateToken, 
  authorizeRole("view_users"), 
  getUsers
);

// POST /users (Admin) – create user 
router.post("/", 
  authenticateToken, 
  authorizeRole("create_users"), 
  validateRegister,     
  createUser
);

// GET /users/{id} – user profile (self or admin)
router.get("/:id", 
  authenticateToken, 
  canAccessUser(),
  getUserById
);

// PATCH /users/{id} – update profile, role
router.patch("/:id", 
  authenticateToken, 
  canAccessUser(),
  validateUpdateUser,   
  updateUser
);

//DELETE /users/{id} – soft delete / deactivate
router.delete("/:id", 
  authenticateToken, 
  authorizeRole("delete_users"), 
  deleteUser
);

export default router;
