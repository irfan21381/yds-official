import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
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
  const token = generateToken(user._id, user.role, user.collegeId?.toString());

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
   📝 Register
====================================================== */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, collegeId, isPublicStudent } = req.body as {
      email: string;
      password: string;
      role: string;
      collegeId?: string;
      isPublicStudent?: boolean;
    };

    let user = await User.findOne({ email });
    if (user) throw new CustomError("User already exists", 400);

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
        isPublic: isPublicStudent || false,
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

    await sendOTPEmail(user.email, otp);

    return res.status(201).json({
      success: true,
      message: "Registered successfully (DEV MODE)",
      otp, // ⚠️ DEV ONLY
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔑 Login
====================================================== */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

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
   🔢 Send OTP (FIXED – NO TIMEOUT)
====================================================== */
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    console.log("➡️ send-otp hit:", email);

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("User not found", 404);

    const otp = generateOTP();
    user.otpSecret = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp);

    console.log("✅ OTP generated:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP generated (DEV MODE)",
      otp, // ⚠️ DEV ONLY
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   ✅ Verify OTP
====================================================== */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };

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
   🔁 Reset Password (Forgot Password)
====================================================== */
export const resetPasswordWithOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body as {
      email: string;
      otp: string;
      newPassword: string;
    };

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("User not found", 404);

    if (user.otpSecret !== otp) throw new CustomError("Invalid OTP", 400);

    user.password = newPassword;
    user.otpSecret = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔒 Change Password (Logged in)
====================================================== */
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { newPassword } = req.body as { newPassword: string };

    if (!userId) {
      throw new CustomError("User not authenticated", 401);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) throw new CustomError("User not found", 404);

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
