import nodemailer from 'nodemailer';


export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

//createTransport (NOT createTransporter)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Test on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Warning:', error.message);
  } else {
    console.log('SMTP Ready');
  }
});

export const sendOtpEmail = async (email, otp) => {
  try {
    console.log('📧 Sending OTP to:', email);
    
    const mailOptions = {
      from: `"LMS Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8fafc;">
          <h1 style="color: #1e293b; font-size: 28px; text-align: center;">LMS Platform</h1>
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                      color: white; padding: 40px; text-align: center; border-radius: 16px; margin: 30px 0;">
            <h2 style="margin: 0 0 20px 0;">Your Verification Code</h2>
            <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; margin: 20px 0;">
              ${otp}
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="color: #64748b; margin: 0 0 10px 0;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="color: #64748b; margin: 0;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Your LMS OTP: ${otp} (expires in 10 minutes)`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return info;

  } catch (error) {
    console.error('Email failed:', error.message);
    
    //  i will change it later for prodduvtion
    console.log(` MANUAL OTP for ${email}: ${otp}`);
    console.log(' Copy this 6-digit code for /verify-otp');
    
    return { 
      messageId: 'terminal-fallback',
      debug: { otp, email }
    };
  }
};
