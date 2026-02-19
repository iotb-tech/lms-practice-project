import express from "express";
import { getRoles } from '../controllers/roleController.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";

const router = express.Router();

// GET /roles – list roles and permissions
router.get("/", 
  authenticateToken, 
  authorizeRole("view_roles"), 
  getRoles
);

export default router;
