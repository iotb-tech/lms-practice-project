import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Auth Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Expires in 10 Minutes',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #007bff;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 16px;">
            This code will expire in <strong>10 minutes</strong>. 
            Do not share this code with anyone.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error('Failed to send verification email');
  }
};
