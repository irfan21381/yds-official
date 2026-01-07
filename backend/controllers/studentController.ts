import { Request, Response, NextFunction } from "express";
import Material from "../models/Material";
import Subject from "../models/Subject";
import Quiz from "../models/Quiz";
import QuizAttempt from "../models/QuizAttempt";
import User from "../models/User";
import Student from "../models/Student";
import { CustomError } from "../utils/errorHandler";
import { generateEmbeddings } from "../services/embeddingService";
import { searchEmbeddings } from "../services/vectorService";
import { generateText } from "../services/llmService";

/** 🔑 shared auth type */
interface AuthUser {
  id: string;
  role: string;
  collegeId?: string;
}

/** helper */
const getUser = (req: Request): AuthUser => {
  const user = (req as any).user as AuthUser | undefined;
  if (!user) throw new CustomError("Not authorized", 403);
  return user;
};

/* =========================================================
   PROFILE
   ========================================================= */

export const getStudentMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const user = await User.findById(auth.id).select("-password");
    const student = await Student.findOne({ userId: auth.id })
      .populate("collegeId", "name")
      .populate("enrolledSubjects", "name");

    res.json({ success: true, data: { user, student } });
  } catch (e) {
    next(e);
  }
};

/** 🔥 FIXED: Matches Frontend Data Structure and Payload mapping */
export const updateStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const { fullName, name, collegeName, whatsapp, city, nationality } = req.body;

    // Mapping 'fullName' from frontend to 'name' in MongoDB
    const updateData = {
      name: fullName || name, 
      collegeName,
      whatsapp,
      city,
      nationality
    };

    const student = await Student.findOneAndUpdate(
      { userId: auth.id },
      updateData,
      { new: true }
    );

    // FIXED: Wrapping in { student } to match frontend res.data.data.student
    res.json({ success: true, data: { student } }); 
  } catch (e) {
    next(e);
  }
};

/* =========================================================
   COURSES / SUBJECTS
   ========================================================= */

/** 🔥 FIXED: Fetching actual database records instead of empty [] */
export const getStudentEnrolledSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const student = await Student.findOne({ userId: auth.id }).populate("enrolledSubjects");
    
    if (!student) throw new CustomError("Student record not found", 404);

    // Returning actual subjects from DB
    res.json({ 
      success: true, 
      data: student.enrolledSubjects || [] 
    });
  } catch (e) {
    next(e);
  }
};

/* =========================================================
   MATERIALS
   ========================================================= */

export const getStudentMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const student = await Student.findOne({ userId: auth.id });
    if (!student) throw new CustomError("Student not found", 404);

    const query: any = { status: "APPROVED" };

    if (student.isPublic) {
      query.collegeId = { $exists: false };
    } else {
      query.collegeId = auth.collegeId;
      query.subjectId = { $in: student.enrolledSubjects };
    }

    const materials = await Material.find(query).populate("subjectId", "name");
    res.json({ success: true, data: materials });
  } catch (e) {
    next(e);
  }
};

/* =========================================================
   AI & QUIZZES (Kept same as provided)
   ========================================================= */

export const askAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, materialId } = req.body;
    let answer = "";

    if (materialId) {
      const vector = await generateEmbeddings(question);
      const chunks = await searchEmbeddings(vector, 5, materialId);
      const context = chunks.map(c => c.chunkText).join("\n");

      answer = context
        ? await generateText(`Context:\n${context}\n\nQ:${question}`)
        : await generateText(question);
    } else {
      answer = await generateText(question);
    }

    res.json({ success: true, data: { answer } });
  } catch (e) {
    next(e);
  }
};

export const getAvailableQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await Quiz.find().populate("subjectId", "name");
    res.json({ success: true, data: quizzes });
  } catch (e) {
    next(e);
  }
};

export const getStudentStats = async (req: Request, res: Response) => {
  // Can be expanded to count materials/quizzes
  res.json({ success: true, data: { coursesCount: 0, quizzesCount: 0 } });
};

export const getStudentActivity = async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};
