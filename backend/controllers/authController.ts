import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import College from "../models/College";
import Student from "../models/Student";
import Teacher from "../models/Teacher";
import { generateToken } from "../utils/jwt";
import { generateOTP, sendOTPEmail } from "../utils/otp";
import { CustomError } from "../utils/errorHandler";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    collegeId?: string;
  };
}

/* ======================================================
   🔐 Helper: Send JWT
====================================================== */
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(
    user._id,
    user.role,
    user.collegeId?.toString()
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      isVerified: user.isVerified,
    },
  });
};

/* ======================================================
   📝 Register (FINAL – STABLE)
====================================================== */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      role = "STUDENT",
      collegeId,
      isPublicStudent = true,
    } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    let user = await User.findOne({ email });
    if (user) {
      throw new CustomError("User already exists", 400);
    }

    if (collegeId && role !== "SUPER_ADMIN") {
      const college = await College.findById(collegeId);
      if (!college) throw new CustomError("College not found", 404);
    }

    user = await User.create({
      email,
      password,
      role,
      collegeId: collegeId || undefined,
      isVerified: false,
    });

    if (role === "STUDENT") {
      await Student.create({
        userId: user._id,
        collegeId: isPublicStudent ? undefined : user.collegeId,
        isPublic: isPublicStudent,
      });
    }

    if (role === "TEACHER") {
      await Teacher.create({
        userId: user._id,
        collegeId: user.collegeId,
      });
    }

    const otp = generateOTP();
    user.otpSecret = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // 🔥 NON-BLOCKING EMAIL (NO TIMEOUT)
    sendOTPEmail(user.email, otp).catch((err) => {
      console.error("OTP EMAIL FAILED (register):", err);
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully. OTP sent to email.",
      otp, // DEV ONLY
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔑 Login (Password)
====================================================== */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email & password required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new CustomError("Invalid credentials", 401);

    const isMatch = await (user as any).matchPassword(password);
    if (!isMatch) throw new CustomError("Invalid credentials", 401);

    if (!user.isVerified) {
      throw new CustomError("Account not verified", 403);
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔢 Send OTP (LOGIN / RESEND) – FINAL FIX
====================================================== */
export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new CustomError("Email required", 400);

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("User not found", 404);

    const otp = generateOTP();
    user.otpSecret = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // 🔥 NON-BLOCKING EMAIL
    sendOTPEmail(user.email, otp).catch((err) => {
      console.error("OTP EMAIL FAILED (sendOtp):", err);
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // DEV ONLY
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   ✅ Verify OTP
====================================================== */
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("User not found", 404);

    if (!user.otpSecret || user.otpSecret !== otp) {
      throw new CustomError("Invalid OTP", 400);
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      throw new CustomError("OTP expired", 400);
    }

    user.otpSecret = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔒 Change Password
====================================================== */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { newPassword } = req.body;

    if (!userId) throw new CustomError("Not authenticated", 401);

    const user = await User.findById(userId).select("+password");
    if (!user) throw new CustomError("User not found", 404);

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
