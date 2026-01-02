import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { CustomError } from "../utils/errorHandler";

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
      status: user.status,
    },
  });
};

/* ======================================================
   🧑‍🎓 STUDENT REGISTER (NO OTP, NO LOGIN)
====================================================== */
export const registerStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    const existingUser = await User.findOne({ email });

    // 🔁 Already registered
    if (existingUser) {
      if (existingUser.status === "PENDING") {
        return res.status(200).json({
          success: true,
          message:
            "Your account creation is under process. Please wait some time.",
        });
      }

      throw new CustomError(
        "Account already exists. Please login.",
        400
      );
    }

    await User.create({
      email,
      password,
      role: "STUDENT",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message:
        "Registration received. Please wait up to 12 hours. Your account creation is under process.",
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔑 LOGIN (BLOCK IF PENDING)
====================================================== */
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

    // ⏳ BLOCK PENDING USERS
    if (user.status === "PENDING") {
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_PENDING",
        message:
          "Your account creation is under process. Please wait some time before login.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🔍 CHECK ACCOUNT STATUS (HOMEPAGE)
====================================================== */
export const checkAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.query;

    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        exists: false,
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};
