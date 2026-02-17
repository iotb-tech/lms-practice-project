import { 
  registerService, 
  verifyOtpService, 
  loginService, 
  refreshTokenService 
} from '../services/authService.js';

import { sendSuccessResponse } from '../utils/response.js';

export const registerUser = async (req, res, next) => {
  try {
    const result = await registerService(req.validatedData);
    sendSuccessResponse(res, 201, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtpHandler = async (req, res, next) => {
  try {
    const tokens = await verifyOtpService(req.validatedData.otp);
    sendSuccessResponse(res, 200, 'Email verification successful', tokens);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;
    const tokens = await loginService(email, password);
    sendSuccessResponse(res, 200, 'Login successful', tokens);
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const newTokens = await refreshTokenService(req.validatedData.refreshToken);
    sendSuccessResponse(res, 200, 'Tokens refreshed successfully', newTokens);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  sendSuccessResponse(res, 200, 'Profile retrieved successfully', req.user);
};
