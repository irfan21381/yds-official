import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { CustomError } from "../utils/errorHandler";

/* ======================================
   GET ALL USERS (FILTER BY ROLE & STATUS)
====================================== */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, status } = req.query;

    const query: any = {};

    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select("_id email role status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================
   APPROVE USER (STUDENT / EMPLOYEE / TEACHER)
====================================== */
export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not found", 404);

    user.status = "APPROVED";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved successfully",
    });
  } catch (err) {
    next(err);
  }
};
