import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { CustomError } from "../utils/errorHandler";

/* ======================================
   GET PENDING STUDENTS
====================================== */
export const getPendingStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await User.find({
      role: "STUDENT",
      status: "PENDING",
    }).select("_id email createdAt");

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================
   APPROVE STUDENT
====================================== */
export const approveStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) throw new CustomError("Student not found", 404);

    student.status = "APPROVED";
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student approved successfully",
    });
  } catch (err) {
    next(err);
  }
};
