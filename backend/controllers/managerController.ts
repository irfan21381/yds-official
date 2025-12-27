import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import College from "../models/College";
import Teacher from "../models/Teacher";
import Student from "../models/Student";
import Subject from "../models/Subject";
import Material from "../models/Material";
import Quiz from "../models/Quiz";
import QuizAttempt from "../models/QuizAttempt";
import Embedding from "../models/Embedding";
import { CustomError } from "../utils/errorHandler";
import { generateOTP, sendOTPEmail } from "../utils/otp";
import AuditLog from "../models/AuditLog";
import csv from "csv-parser";
import { Readable } from "stream";

interface AuthenticatedUser {
  id: string;
  role: string;
  collegeId?: string;
}

interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
  file?: Express.Multer.File;
}

interface StudentCSVRow {
  email: string;
  subjects: string[];
}

/* ============================================================
   ADD TEACHER
============================================================ */
export const addTeacher = async (
  req: AuthenticatedRequest<any, any, { email: string; subjects: string[] }>,
  res: Response,
  next: NextFunction
) => {
  const { email, subjects } = req.body;

  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId) {
      throw new CustomError("Only Managers can add teachers to their college", 403);
    }

    const collegeId = req.user.collegeId;
    const college = await College.findById(collegeId);
    if (!college) throw new CustomError("College not found", 404);

    let teacherUser = await User.findOne({ email });

    if (teacherUser) {
      if (teacherUser.role === "TEACHER" && teacherUser.collegeId?.toString() === collegeId) {
        throw new CustomError("This user is already a teacher for this college", 400);
      }

      teacherUser.role = "TEACHER";
      teacherUser.collegeId = college._id;
      teacherUser.isVerified = false;
      delete (teacherUser as any).password;
      await teacherUser.save();
    } else {
      teacherUser = await User.create({
        email,
        role: "TEACHER",
        collegeId: college._id,
        isVerified: false,
      });
    }

    // Create or update teacher profile
    let profile = await Teacher.findOne({ userId: teacherUser._id });
    if (profile) {
      profile.subjects = subjects;
      await profile.save();
    } else {
      profile = await Teacher.create({
        userId: teacherUser._id,
        collegeId,
        subjects,
      });
    }

    // Add teacher to subjects
    if (subjects?.length) {
      await Subject.updateMany(
        { _id: { $in: subjects }, collegeId },
        { $addToSet: { teacherIds: teacherUser._id } }
      );
    }

    // Send OTP
    const otp = generateOTP();
    teacherUser.otpSecret = otp;
    teacherUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await teacherUser.save();
    await sendOTPEmail(teacherUser.email, otp);

    await AuditLog.create({
      userId: req.user.id,
      action: "TEACHER_ADDED",
      details: { teacherId: teacherUser._id, email, subjects },
      collegeId,
    });

    res.json({
      success: true,
      message: `Teacher ${email} added. OTP sent.`,
      data: teacherUser,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   ADD STUDENT
============================================================ */
export const addStudent = async (
  req: AuthenticatedRequest<any, any, { email: string; enrolledSubjects: string[] }>,
  res: Response,
  next: NextFunction
) => {
  const { email, enrolledSubjects } = req.body;

  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId) {
      throw new CustomError("Only Managers can add students", 403);
    }

    const collegeId = req.user.collegeId;
    const college = await College.findById(collegeId);
    if (!college) throw new CustomError("College not found", 404);

    let studentUser = await User.findOne({ email });

    if (studentUser) {
      if (studentUser.role === "STUDENT" && studentUser.collegeId?.toString() === collegeId) {
        throw new CustomError("This user is already a student in this college", 400);
      }

      studentUser.role = "STUDENT";
      studentUser.collegeId = college._id;
      studentUser.isVerified = false;
      delete (studentUser as any).password;
      await studentUser.save();
    } else {
      studentUser = await User.create({
        email,
        role: "STUDENT",
        collegeId: college._id,
        isVerified: false,
      });
    }

    // Create student profile
    let profile = await Student.findOne({ userId: studentUser._id });
    if (profile) {
      profile.enrolledSubjects = enrolledSubjects;
      await profile.save();
    } else {
      profile = await Student.create({
        userId: studentUser._id,
        collegeId,
        isPublic: false,
        enrolledSubjects,
      });
    }

    // Send OTP
    const otp = generateOTP();
    studentUser.otpSecret = otp;
    studentUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await studentUser.save();
    await sendOTPEmail(studentUser.email, otp);

    await AuditLog.create({
      userId: req.user.id,
      action: "STUDENT_ADDED",
      details: { studentId: studentUser._id, email, enrolledSubjects },
      collegeId,
    });

    res.json({
      success: true,
      message: `Student ${email} added. OTP sent.`,
      data: studentUser,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   CSV STUDENT IMPORT
============================================================ */
export const uploadStudentsCSV = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId) {
      throw new CustomError("Only Managers can upload CSV", 403);
    }

    if (!req.file) throw new CustomError("CSV file missing", 400);

    const collegeId = req.user.collegeId;

    const rows: StudentCSVRow[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", (r) => {
        if (r.email && r.subjects) {
          rows.push({
            email: r.email.trim(),
            subjects: r.subjects.split(",").map((s: string) => s.trim()),
          });
        }
      })
      .on("end", async () => {
        const results: any[] = [];

        for (const row of rows) {
          try {
            const subjectIds = await Promise.all(
              row.subjects.map(async (name) => {
                let subject = await Subject.findOne({ name, collegeId });
                if (!subject) subject = await Subject.create({ name, collegeId, teacherIds: [] });
                return subject._id.toString();
              })
            );

            let user = await User.findOne({ email: row.email });

            if (user && user.role === "STUDENT" && user.collegeId?.toString() === collegeId) {
              let profile = await Student.findOne({ userId: user._id });
              if (profile) {
                profile.enrolledSubjects = subjectIds;
                await profile.save();
              }
              results.push({ email: row.email, status: "updated" });
            } else if (!user) {
              user = await User.create({
                email: row.email,
                role: "STUDENT",
                collegeId,
                isVerified: false,
              });

              await Student.create({
                userId: user._id,
                collegeId,
                isPublic: false,
                enrolledSubjects: subjectIds,
              });

              const otp = generateOTP();
              user.otpSecret = otp;
              user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
              await user.save();
              await sendOTPEmail(user.email, otp);

              results.push({ email: row.email, status: "created" });
            } else {
              results.push({ email: row.email, status: "skipped", reason: "User exists in another role" });
            }
          } catch (err: any) {
            results.push({ email: row.email, status: "failed", error: err.message });
          }
        }

        res.json({ success: true, results });
      })
      .on("error", (err) => next(new CustomError(err.message, 400)));
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   APPROVE MATERIAL
============================================================ */
export const approveMaterial = async (
  req: AuthenticatedRequest<{ materialId: string }, any, { status: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId) {
      throw new CustomError("Only Managers can approve materials", 403);
    }

    const material = await Material.findById(req.params.materialId);
    if (!material) throw new CustomError("Material not found", 404);

    if (material.collegeId?.toString() !== req.user.collegeId) {
      throw new CustomError("You cannot approve materials for another college", 403);
    }

    material.status = req.body.status;
    await material.save();

    await AuditLog.create({
      userId: req.user.id,
      action: "MATERIAL_APPROVED_REJECTED",
      details: { materialId: material._id, status: req.body.status },
      collegeId: material.collegeId,
    });

    res.json({ success: true, message: "Material updated", data: material });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   COLLEGE ANALYTICS
============================================================ */
export const getCollegeAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId)
      throw new CustomError("Only Managers can view analytics", 403);

    const collegeId = req.user.collegeId;

    const totalTeachers = await User.countDocuments({ role: "TEACHER", collegeId });
    const totalStudents = await User.countDocuments({ role: "STUDENT", collegeId });
    const totalSubjects = await Subject.countDocuments({ collegeId });
    const totalMaterials = await Material.countDocuments({ collegeId, status: "APPROVED" });
    const pendingMaterials = await Material.countDocuments({ collegeId, status: "PENDING" });
    const totalQuizzes = await Quiz.countDocuments({ collegeId });
    const totalQuizAttempts = await QuizAttempt.countDocuments({ collegeId });

    const materialIds = await Material.find({ collegeId }).distinct("_id");
    const aiUsage = {
      totalEmbeddings: await Embedding.countDocuments({
        materialId: { $in: materialIds.map(id => id.toString()) },
      }),
    };

    res.json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalSubjects,
        totalMaterials,
        pendingMaterials,
        totalQuizzes,
        totalQuizAttempts,
        aiUsage,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   SUBJECTS / MATERIALS FOR COLLEGE
============================================================ */
export const getSubjectsForCollege = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.collegeId) throw new CustomError("College ID missing", 400);

    const data = await Subject.find({ collegeId: req.user.collegeId });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPendingMaterialsForCollege = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.collegeId) throw new CustomError("College ID missing", 400);

    const data = await Material.find({
      collegeId: req.user.collegeId,
      status: "PENDING",
    })
      .populate("subjectId", "name")
      .populate("teacherId", "email");

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   CREATE SUBJECT
============================================================ */
export const createSubject = async (
  req: AuthenticatedRequest<any, any, { name: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "MANAGER" || !req.user.collegeId) {
      throw new CustomError("Only Managers can create subjects", 403);
    }

    const collegeId = req.user.collegeId;
    const { name } = req.body;

    const exists = await Subject.findOne({ name, collegeId });
    if (exists) throw new CustomError("Subject already exists", 400);

    const subject = await Subject.create({
      name,
      collegeId,
      teacherIds: [],
    });

    await AuditLog.create({
      userId: req.user.id,
      action: "SUBJECT_CREATED",
      details: { subjectId: subject._id, name },
      collegeId,
    });

    res.status(201).json({
      success: true,
      message: "Subject created",
      data: subject,
    });
  } catch (err) {
    next(err);
  }
};
