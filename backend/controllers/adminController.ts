import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import College from "../models/College";
import { CustomError } from "../utils/errorHandler";

/** 🚀 Fast Access Helper */
const getUser = (req: Request) => (req as any).user;

/* =========================
   USER MANAGEMENT
========================= */

/**
 * GET ALL USERS (with search)
 * GET /api/admin/users?search=
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE USER
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role, collegeId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      throw new CustomError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      collegeId,
      isVerified: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE USER  ✅ (FIXED EXPORT)
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * ACTIVATE / DEACTIVATE USER
 */
export const updateUserStatus = async (
  req: Request,
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

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/* =========================
   COLLEGE MANAGEMENT
========================= */

/**
 * CREATE COLLEGE
 */
export const createCollege = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const college = await College.create({
      ...req.body,
      superAdminId: getUser(req)?.id,
    });

    res.status(201).json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL COLLEGES
 */
export const getAllColleges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: colleges });
  } catch (err) {
    next(err);
  }
};

/**
 * ASSIGN MANAGER TO COLLEGE
 */
export const assignManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId } = req.params;
    const { managerId } = req.body;

    const college = await College.findByIdAndUpdate(
      collegeId,
      { managerId },
      { new: true }
    );

    if (!college) {
      throw new CustomError("College not found", 404);
    }

    res.json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

/**
 * ACTIVATE / DEACTIVATE COLLEGE
 */
export const activateDeactivateCollege = async (
  req: Request,
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

    if (!college) {
      throw new CustomError("College not found", 404);
    }

    res.json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

/* =========================
   ANALYTICS
========================= */

/**
 * GLOBAL ANALYTICS
 */
export const getGlobalAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = {
      totalUsers: await User.countDocuments(),
      totalColleges: await College.countDocuments(),
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
