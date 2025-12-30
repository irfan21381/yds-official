import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
   ✉️ SEND LOGIN OTP (RENDER-SAFE)
====================================================== */
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: "Yasin Digital Solutions <onboarding@resend.dev>",
    to: email,
    subject: "Login OTP - Yasin Digital Solutions",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Login Verification Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
        <p>If you did not request this login, please ignore this email.</p>
        <br/>
        <p>— Team Yasin Digital Solutions</p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ RESEND ERROR:", error);
    throw new Error("Failed to send login OTP email");
  }

  console.log(`✅ Login OTP sent to ${email} via Resend`);
};