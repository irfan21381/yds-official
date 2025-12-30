import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ======================================================
   📧 SMTP TRANSPORTER (RENDER SAFE)
====================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.zoho.in",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,        // MUST be false for 587
  requireTLS: true,     // force TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10_000, // 10 sec
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

/* ======================================================
   🔍 VERIFY SMTP ON STARTUP
====================================================== */
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP VERIFY FAILED:", error);
  } else {
    console.log("✅ SMTP SERVER READY");
  }
});

/* ======================================================
   🔢 GENERATE LOGIN OTP
====================================================== */
export const generateOTP = (): string =>
  otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

/* ======================================================
   ✉️ SEND LOGIN OTP EMAIL
====================================================== */
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  const info = await transporter.sendMail({
    from: `"Yasin Digital Solutions" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Login OTP - Yasin Digital Solutions",
    html: `
      <h2>Your Login OTP</h2>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });

  console.log("📨 MAIL SENT:", info.messageId);
};