import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import { CustomError } from "../utils/errorHandler";

// 🚀 FAST ACCESS & SEARCH
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

// ... Add 'export const' to updateUser, deleteUser, updateUserStatus, createCollege, assignManager, activateDeactivateCollege, getAllColleges

export const getGlobalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      colleges: await College.countDocuments(),
      users: await User.countDocuments(),
    };
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
