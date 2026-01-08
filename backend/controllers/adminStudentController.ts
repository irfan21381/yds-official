import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { CustomError } from "../utils/errorHandler";

/* ======================================
   GET PENDING STUDENTS
====================================== */
/** 🚀 FAST ACCESS: Added .lean() for faster database read */
export const getPendingStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await User.find({
      role: "STUDENT",
      status: "PENDING",
    })
    .select("_id email createdAt")
    .sort({ createdAt: -1 })
    .lean(); // Faster performance

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
/** 🚀 FIXED: Handling studentId to match routes parameter */
export const approveStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 💡 studentRoutes.ts లో :studentId అని ఉంటే ఇక్కడ studentId అని వాడాలి
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) throw new CustomError("Student not found", 404);

    student.status = "APPROVED";
    student.isActive = true; // Automatically activating the user upon approval
    
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student approved successfully",
      data: {
        id: student._id,
        status: student.status
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================
   GET ALL STUDENTS WITH SEARCH (Optional New Feature)
====================================== */
/** 🔍 Added Search functionality for fast access */
export const getAllStudentsDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    let query: any = { role: "STUDENT" };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ];
    }

    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};
