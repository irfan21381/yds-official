import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import Student from "../models/Student"; 
import AuditLog from "../models/AuditLog";
import { CustomError } from "../utils/errorHandler";
import { generateOTP, sendOTPEmail } from "../utils/otp";

/* =========================
   AUTHENTICATED REQUEST TYPE
========================= */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    collegeId?: string;
  };
}

/* =========================
   USER & STUDENT MANAGEMENT
========================= */

// 🚀 FAST GET ALL USERS WITH SEARCH
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    let query: any = {};

    // 🔍 Search by Email, Role, or Status
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } }
      ];
    }

    // Optimization: .lean() makes queries much faster by returning plain JSON
    const users = await User.find(query)
      .select("-password") 
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET PENDING APPROVALS
export const getPendingStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pending = await User.find({ status: "PENDING" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: pending });
  } catch (err) {
    next(err);
  }
};

// APPROVE STUDENT
export const approveStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED", isActive: true },
      { new: true }
    ).select("-password");

    if (!user) throw new CustomError("User not found", 404);

    res.json({ success: true, message: "User approved successfully", data: user });
  } catch (err) {
    next(err);
  }
};

// CREATE USER
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
      status: "APPROVED"
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

/* =========================
   COLLEGE MANAGEMENT
========================= */

export const getAllColleges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const colleges = await College.find().lean();
    res.json({ success: true, data: colleges });
  } catch (err) {
    next(err);
  }
};

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
      pendingApprovals: await User.countDocuments({ status: "PENDING" })
    };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
