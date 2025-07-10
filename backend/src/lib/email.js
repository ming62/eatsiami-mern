import nodemailer from 'nodemailer';
import "dotenv/config";

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (email, resetCode)   => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - EatSiami',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff5f00; margin-bottom: 10px;">EatSiami</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          You requested to reset your password for your EatSiami account.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your reset code is:
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #ff5f00; letter-spacing: 8px;">
            ${resetCode}
          </div>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Enter this code in the app to reset your password.
        </p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            ⚠️ This code will expire in 10 minutes for security reasons.
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If you didn't request this password reset, please ignore this email. Your account remains secure.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from EatSiami. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log('Email sent successfully to', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}