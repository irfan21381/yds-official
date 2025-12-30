import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ======================================================
   📧 ZOHO SMTP TRANSPORTER (LOGIN OTP)
====================================================== */
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,          // ✅ ZOHO SSL
  secure: true,       // ✅ MUST be true for 465
  auth: {
    user: process.env.MAIL_USER, // your Zoho email
    pass: process.env.MAIL_PASS, // Zoho App Password
  },
});

/* ======================================================
   🔢 GENERATE LOGIN OTP
====================================================== */
export const generateOTP = (): string => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

/* ======================================================
   ✉️ SEND LOGIN OTP EMAIL
====================================================== */
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Yasin Digital Solutions" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Login OTP - Yasin Digital Solutions",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Login Verification Code</h2>
          <p>Your <strong>Login OTP</strong> is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
          <p>If you did not request this login, please ignore this email.</p>
          <br/>
          <p>— Team Yasin Digital Solutions</p>
        </div>
      `,
    });

    console.log(`✅ LOGIN OTP sent via ZOHO to ${email}`);
  } catch (error) {
    console.error("❌ ZOHO SMTP ERROR:", error);
    throw new Error("Failed to send login OTP email");
  }
};