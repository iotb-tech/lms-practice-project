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
  const result = await register(req.validated);
  sendSuccessResponse(res, 201, 'Registration successful. Check your email for OTP.', result);
 } catch (error) {
  next(error);
 }
};

export const verifyOtpHandler = async (req, res, next) => {
 try {
  const tokens = await verifyOtp(req.validated.otp);
  sendSuccessResponse(res, 200, 'Email verification successful', tokens);
 } catch (error) {
  next(error);
 }
};

export const loginUser = async (req, res, next) => {
 try {
  const tokens = await login(req.validated.email, req.validated.password);
  sendSuccessResponse(res, 200, 'Login successful', tokens);
 } catch (error) {
  next(error);
 }
};

export const refreshAccessToken = async (req, res, next) => {
 try {
  const newTokens = await refreshTokenFunc(req.validated.refreshToken);
  sendSuccessResponse(res, 200, 'Tokens refreshed successfully', newTokens);
 } catch (error) {
  next(error);
 }
};

export const getProfile = async (req, res) => {
 sendSuccessResponse(res, 200, 'Profile retrieved successfully', req.user);
};
