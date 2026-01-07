import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import AuditLog from "../models/AuditLog";
import { CustomError } from "../utils/errorHandler";
import { generateOTP, sendOTPEmail } from "../utils/otp";

/* =========================
   AUTHENTICATED REQUEST
========================= */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    collegeId?: string;
  };
}

/* =========================
   USER MANAGEMENT
========================= */

// GET ALL USERS
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find()
      .select("-password") // 🔥 never expose password
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET USER DETAILS
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw new CustomError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// CREATE USER (EMP / STUDENT / TEACHER)
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role, collegeId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new CustomError("User already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      collegeId,
      isVerified: true,
      isActive: true,
    });

    await AuditLog.create({
      userId: req.user?.id,
      action: "USER_CREATED",
      details: { email, role },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// UPDATE USER
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!user) throw new CustomError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE USER
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new CustomError("User not found", 404);

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// ACTIVATE / DEACTIVATE USER
export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/* =========================
   COLLEGE MANAGEMENT
========================= */

export const createCollege = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const exists = await College.findOne({ name });
    if (exists) throw new CustomError("College already exists", 400);

    const college = await College.create({
      name,
      superAdminId: req.user?.id,
      isActive: true,
    });

    res.status(201).json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

export const assignManager = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId, managerEmail } = req.body;

    let manager = await User.findOne({ email: managerEmail });

    if (!manager) {
      manager = await User.create({
        email: managerEmail,
        role: "MANAGER",
        collegeId,
        isVerified: false,
      });
    } else {
      manager.role = "MANAGER";
      manager.collegeId = collegeId;
    }

    const otp = generateOTP();
    manager.otpSecret = otp;
    manager.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await manager.save();

    await sendOTPEmail(manager.email, otp);

    res.json({
      success: true,
      message: "Manager assigned & OTP sent",
    });
  } catch (err) {
    next(err);
  }
};

export const activateDeactivateCollege = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId } = req.params;
    const { isActive } = req.body;

    const college = await College.findByIdAndUpdate(
      collegeId,
      { isActive },
      { new: true }
    );

    if (!college) throw new CustomError("College not found", 404);

    res.json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

export const getAllColleges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const colleges = await College.find();
    res.json({ success: true, data: colleges });
  } catch (err) {
    next(err);
  }
};

/* =========================
   ANALYTICS
========================= */
export const getGlobalAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = {
      colleges: await College.countDocuments(),
      users: await User.countDocuments(),
      students: await User.countDocuments({ role: "STUDENT" }),
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};