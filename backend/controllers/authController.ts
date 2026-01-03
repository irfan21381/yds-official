import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { CustomError } from "../utils/errorHandler";

/* =========================
   LOGIN (ADMIN + APPROVED USERS)
========================= */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    // ⛔ Block only pending students
    if (user.role === "STUDENT" && user.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message:
          "Your account creation is under process. Please wait.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    const token = generateToken(
      user._id,
      user.role,
      user.collegeId?.toString()
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
