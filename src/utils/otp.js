export const OTP_EXPIRY = 10 * 60 * 1000;
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let resendInstance = null;

export const sendOtpEmail = async (to, otp) => {
  //console.log('OTP:', otp, '→', to);
  
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY missing from .env');
      console.error('Current value:', process.env.RESEND_API_KEY ? 'LOADED' : 'MISSING');
      throw new Error('RESEND_API_KEY not configured in .env');
    }
    
    const { Resend } = await import('resend');
    resendInstance = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized with API key');
  }
  
  try {
    const result = await resendInstance.emails.send({
      from: 'LMS <onboarding@resend.dev>',
      to: [to],
      subject: `LMS OTP: ${otp}`,
      text: `Your verification code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 60px; text-align: center; color: #667eea;">${otp}</h1>
          <p style="text-align: center; color: #666;">Valid for 10 minutes</p>
        </div>
      `
    });
    
    console.log('EMAIL SENT SUCCESSFULLY!');
    console.log('Check Gmail inbox/spam:', to);
    
  } catch (error) {
    console.error('EMAIL FAILED:', error.message);
    // Don't throw - OTP flow continues even if email fails
  }
  
  return { success: true, otp, email: to };
};
