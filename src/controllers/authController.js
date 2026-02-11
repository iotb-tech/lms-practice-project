import { register, verifyOtp, login, refreshTokenFunc } from '../services/authService.js';

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const registerUser = async (req, res, next) => {
  try {
    // req.validatedData (not req.validated)
    const result = await register(req.validatedData);
    sendSuccessResponse(res, 201, 'Registration successful. Check your email for OTP.', result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtpHandler = async (req, res, next) => {
  try {
    // req.validatedData.otp
    const tokens = await verifyOtp(req.validatedData.otp);
    sendSuccessResponse(res, 200, 'Email verification successful', tokens);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    // Destructure from req.validatedData
    const { email, password } = req.validatedData;
    const tokens = await login(email, password);
    sendSuccessResponse(res, 200, 'Login successful', tokens);
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    //req.validatedData.refreshToken
    const newTokens = await refreshTokenFunc(req.validatedData.refreshToken);
    sendSuccessResponse(res, 200, 'Tokens refreshed successfully', newTokens);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  sendSuccessResponse(res, 200, 'Profile retrieved successfully', req.user);
};
