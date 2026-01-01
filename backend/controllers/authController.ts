import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import College from "../models/College";
import Student from "../models/Student";
import Teacher from "../models/Teacher";
import { generateToken } from "../utils/jwt";
import { CustomError } from "../utils/errorHandler";

/* ======================================================
   TYPES
====================================================== */
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
const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response
) => {
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
      isTempPassword: user.isTempPassword, // 🔥 IMPORTANT
    },
  });
};

/* ======================================================
   🧑‍💼 ADMIN CREATE USER (TEMP PASSWORD)
====================================================== */
export const adminCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      role = "STUDENT",
      collegeId,
      isPublicStudent = true,
    } = req.body;

    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError("User already exists", 400);
    }

    if (collegeId && role !== "SUPER_ADMIN") {
      const college = await College.findById(collegeId);
      if (!college) {
        throw new CustomError("College not found", 404);
      }
    }

    // 🔐 Generate TEMP password (simple + free)
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
      email,
      password: tempPassword,
      role,
      collegeId: collegeId || undefined,
      isVerified: true,
      isTempPassword: true, // 🔥 FORCE CHANGE
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      credentials: {
        email,
        password: tempPassword, // ⚠️ ADMIN WILL SHARE MANUALLY
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔑 LOGIN
====================================================== */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email & password required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    // 🔥 FORCE PASSWORD CHANGE
    if (user.isTempPassword) {
      return res.status(200).json({
        success: true,
        mustChangePassword: true,
        userId: user._id,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔒 FORCE CHANGE PASSWORD (FIRST LOGIN)
====================================================== */
export const forceChangePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { newPassword } = req.body;

    if (!userId || !newPassword) {
      throw new CustomError("Invalid request", 400);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    user.password = newPassword;
    user.isTempPassword = false;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔒 CHANGE PASSWORD (NORMAL)
====================================================== */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { newPassword } = req.body;

    if (!userId || !newPassword) {
      throw new CustomError("Invalid request", 400);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
