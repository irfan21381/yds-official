import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

/* ======================================================
   🔐 RESEND CLIENT (SAFE INIT)
====================================================== */
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/* ======================================================
   🔢 GENERATE 6-DIGIT OTP
====================================================== */
export const generateOTP = (): string => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

/* ======================================================
   ✉️ SEND OTP EMAIL (PRODUCTION SAFE – RENDER)
====================================================== */
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    const { error } = await resend.emails.send({
      from: "Yasin Digital Solutions <onboarding@resend.dev>", // ✅ verified sender
      to: email,
      subject: "Your Login OTP - Yasin Digital Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
          <div style="max-width:500px;margin:auto;background:white;padding:24px;border-radius:8px;">
            <h2 style="color:#111827;">Login Verification Code</h2>
            <p style="font-size:14px;color:#374151;">
              Use the OTP below to complete your login:
            </p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:20px 0;">
              ${otp}
            </div>
            <p style="font-size:13px;color:#6b7280;">
              This OTP is valid for <b>5 minutes</b>.
            </p>
            <hr style="margin:20px 0;" />
            <p style="font-size:12px;color:#9ca3af;">
              If you didn’t request this login, you can safely ignore this email.
            </p>
            <p style="font-size:12px;color:#9ca3af;">
              — Team <b>Yasin Digital Solutions</b>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ RESEND EMAIL ERROR:", error);
      throw new Error("Resend email failed");
    }

    console.log(`✅ OTP sent successfully to ${email}`);
  } catch (err) {
    console.error("❌ OTP EMAIL SEND FAILED:", err);
    throw err;
  }
};
