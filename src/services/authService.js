import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateTokens } from '../utils/jwt.js';
import { generateOTP } from '../utils/otp.js';
import { createUser, findUserByEmail, findUserById, updateUserOtp, verifyUserOtp } from './userService.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const transporter = nodemailer.createTransport({
 host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
 port: parseInt(process.env.SMTP_PORT) || 2525,
 auth: {
  user: process.env.SMTP_USER || process.env.EMAIL_USER,
  pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
 },
 secure: false,
 tls: { rejectUnauthorized: false }
});

const sendOtpEmail = async (email, otp) => {
 const mailOptions = {
  from: `"LMS App" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Your LMS Verification Code',
  html: `
      <h2>🧑‍🎓 Your Verification Code</h2>
      <div style="background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                  color: white; padding: 20px; text-align: center; 
                  font-size: 32px; font-weight: bold; border-radius: 10px;
                  letter-spacing: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
    `
 };

 try {
  await transporter.sendMail(mailOptions);
  console.log(`EMAIL SENT to ${email}`);
 } catch (error) {
  console.error('EMAIL FAILED:', error.message);
  console.log(`DEV OTP: ${otp}`);  // Fallback for testing
 }
};

export const register = async (userData) => {
 const existingUser = await findUserByEmail(userData.email);
 const otp = generateOTP();
 const expiresAt = new Date(Date.now() + OTP_EXPIRY);
 let userId;

 if (existingUser) {
  if (existingUser.isActive) {
   throw new Error('Email already exists');
  }
  userId = existingUser._id;
  await updateUserOtp(userId, otp, expiresAt);
 } else {
  const user = await createUser(userData);
  userId = user._id;
  await updateUserOtp(userId, otp, expiresAt);
 }

 await sendOtpEmail(userData.email, otp);

 console.log(` REGISTERED: ${userData.email}`);
 console.log(`OTP: ${otp}\n`);

 return { userId };
};

export const verifyOtp = async (userId, otp) => {
 const user = await verifyUserOtp(userId, otp);
 if (!user) {
  throw new Error('Invalid or expired OTP');
 }
 const payload = { userId: user._id, role: user.role };
 return generateTokens(payload);
};

export const login = async (email, password) => {
 const user = await findUserByEmail(email);
 if (!user || !user.isActive || !(await comparePassword(password, user.password))) {
  throw new Error('Invalid credentials');
 }
 const payload = { userId: user._id, role: user.role };
 return generateTokens(payload);
};

export const refreshToken = async (refreshToken) => {
 const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
 const user = await findUserById(decoded.userId);
 if (!user) throw new Error('Invalid refresh token');
 return generateTokens({ userId: user._id, role: user.role });
};
