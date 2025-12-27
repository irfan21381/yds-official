import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email transporter configuration using SMTP from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password
  },
});

export const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'YDS EDUAI - Your OTP for Login',
    html: `<p>Your One-Time Password (OTP) for YDS EDUAI login is: <strong>${otp}</strong></p><p>This OTP is valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP to ${email}:`, error);
    throw new Error('Failed to send OTP email.');
  }
};