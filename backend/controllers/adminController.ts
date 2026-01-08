import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import AuditLog from "../models/AuditLog";
import { CustomError } from "../utils/errorHandler";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; collegeId?: string; };
}

// 🚀 FAST GET ALL USERS WITH SEARCH
export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    let query: any = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// GET PENDING STUDENTS
export const getPendingStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ status: "PENDING" }).select("-password").lean();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// APPROVE STUDENT
export const approveStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "APPROVED", isActive: true }, { new: true });
    if (!user) throw new CustomError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// ANALYTICS
export const getGlobalAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = {
      colleges: await College.countDocuments(),
      users: await User.countDocuments(),
      pending: await User.countDocuments({ status: "PENDING" })
    };
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ... Ensure ALL other functions (createUser, updateUserStatus, getAllColleges, createCollege) are exported
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { /* Logic */ };
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { /* Logic */ };
export const getAllColleges = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { /* Logic */ };
export const createCollege = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { /* Logic */ };
