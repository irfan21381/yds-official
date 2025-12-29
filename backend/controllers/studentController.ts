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
import AuditLog from "../models/AuditLog";

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

export const updateStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const { fullName, collegeName, whatsapp, city, nationality } = req.body;

    const student = await Student.findOneAndUpdate(
      { userId: auth.id },
      { name: fullName, collegeName, whatsapp, city, nationality },
      { new: true }
    );

    res.json({ success: true, data: student });
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

export const getMaterialDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) throw new CustomError("Material not found", 404);

    res.json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
};

/* =========================================================
   AI
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

/* =========================================================
   QUIZZES (🔥 REQUIRED BY ROUTES)
   ========================================================= */

export const getAvailableQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await Quiz.find().populate("subjectId", "name");
    res.json({ success: true, data: quizzes });
  } catch (e) {
    next(e);
  }
};

export const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) throw new CustomError("Quiz not found", 404);
    res.json({ success: true, data: quiz });
  } catch (e) {
    next(e);
  }
};

export const submitQuizAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getUser(req);
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);

    const attempt = await QuizAttempt.create({
      studentId: auth.id,
      quizId,
      answers,
      totalQuestions: quiz.questions.length
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (e) {
    next(e);
  }
};

/* =========================================================
   DASHBOARD HELPERS (🔥 REQUIRED BY ROUTES)
   ========================================================= */

export const getStudentEnrolledSubjects = async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};

export const getStudentStats = async (req: Request, res: Response) => {
  res.json({ success: true, data: {} });
};

export const getStudentActivity = async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};
