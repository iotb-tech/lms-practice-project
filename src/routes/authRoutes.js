import { Router } from "express";
import {
  validateRegister,
  validateLogin,
  validateOtp,
  validateRefreshToken,
} from "../middleware/validation.js";
import {
  registerUser,
  loginUser,
  verifyOtpHandler,
  refreshAccessToken,
  getProfile,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/verify-otp", validateOtp, verifyOtpHandler);
router.post("/refresh", validateRefreshToken, refreshAccessToken);

// Protected route
router.get("/profile", authenticateToken, getProfile);

export default router;
