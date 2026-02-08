import { register, verifyOtp, login, refreshToken } from '../services/authService.js';

export const registerUser = async (req, res, next) => {
 try {
  const { firstName, lastName, email, password, role = 'student' } = req.validated;
  const result = await register({ firstName, lastName, email, password, role });
  res.status(201).json({
   success: true,
   message: 'Registration successful. Check email/console for OTP.',
   data: { userId: result.userId }
  });
 } catch (error) {
  next(error);
 }
};

export const verifyOtpHandler = async (req, res, next) => {
 try {
  const { userId, otp } = req.validated;
  const tokens = await verifyOtp(userId, otp);
  res.json({
   success: true,
   message: 'Verification successful',
   data: tokens
  });
 } catch (error) {
  next(error);
 }
};

export const loginUser = async (req, res, next) => {
 try {
  const { email, password } = req.validated;
  const tokens = await login(email, password);
  res.json({
   success: true,
   message: 'Login successful',
   data: tokens
  });
 } catch (error) {
  next(error);
 }
};

export const refreshAccessToken = async (req, res, next) => {
 try {
  const { refreshToken: token } = req.validated;
  const newTokens = await refreshToken(token);
  res.json({
   success: true,
   message: 'Tokens refreshed successfully',
   data: newTokens
  });
 } catch (error) {
  next(error);
 }
};
