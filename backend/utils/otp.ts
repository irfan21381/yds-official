import otpGenerator from "otp-generator";
import { sendMail } from "./mail";

/* ======================================================
   GENERATE OTP
====================================================== */
export const generateOTP = (): string => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

/* ======================================================
   SEND OTP EMAIL
====================================================== */
export const sendOTPEmail = async (email: string, otp: string) => {
  await sendMail({
    to: email,
    subject: "Your OTP - Yasin Digital Solutions",
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes.</p>
      <br/>
      <p>— Yasin Digital Solutions</p>
    `,
  });
};
