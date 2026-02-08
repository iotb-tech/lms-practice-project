import { AppError } from '../utils/AppError.js';

export const register = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);
  let userId;

  if (existingUser) {
    if (existingUser.isActive) {
      throw new AppError('Email already exists', 400);
    }
    userId = existingUser._id;
    await updateUserOtp(userId, otp, expiresAt);
  } else {
    const user = await createUser(userData);
    userId = user._id;
    await updateUserOtp(userId, otp, expiresAt);
  }

  await sendOtpEmail(userData.email, otp);
  console.log(` REGISTERED: ${userData.email} | OTP: ${otp}`);
  return { userId };
};

export const verifyOtp = async (otp) => {
  const user = await verifyUserOtp(otp);
  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }
  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const login = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user || !user.isActive || !(await comparePassword(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }
  const payload = { userId: user._id, role: user.role };
  return generateTokens(payload);
};

export const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) throw new AppError('Invalid refresh token', 401);
    return generateTokens({ userId: user._id, role: user.role });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
