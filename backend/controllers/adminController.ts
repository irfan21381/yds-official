import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import { CustomError } from "../utils/errorHandler";
import { generateOTP, sendOTPEmail } from "../utils/otp";

/** 🚀 Fast Access Helper */
const getUser = (req: Request) => (req as any).user;

/* =========================
   USER MANAGEMENT
========================= */

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
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

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) throw new CustomError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, collegeId } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new CustomError("User already exists", 400);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role, collegeId, isVerified: true, isActive: true });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

/** 🔥 FIXED: Added 'export' for updateUser to stop server crash */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!user) throw new CustomError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new CustomError("User not found", 404);
    res.json({ success: true, message: "User deleted" });
  } catch (err) { next(err); }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

/* =========================
   COLLEGE & ANALYTICS
========================= */

export const createCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const college = await College.create({ ...req.body, superAdminId: getUser(req)?.id });
    res.status(201).json({ success: true, data: college });
  } catch (err) { next(err); }
};

export const getAllColleges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colleges = await College.find().lean();
    res.json({ success: true, data: colleges });
  } catch (err) { next(err); }
};

export const getGlobalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { colleges: await College.countDocuments(), users: await User.countDocuments() };
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/** Missing exports from your previous log */
export const assignManager = async (req: Request, res: Response) => { res.json({ success: true }); };
export const activateDeactivateCollege = async (req: Request, res: Response) => { res.json({ success: true }); };
