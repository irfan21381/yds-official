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
import InternshipApplication from "../models/InternshipApplication";

/** 🔑 shared auth type (DO NOT extend Request) */
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

// -------------------------
// GET PROFILE
// -------------------------
export const getStudentMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);

    const user = await User.findById(userAuth.id).select("-password");
    if (!user) throw new CustomError("User not found", 404);

    const student = await Student.findOne({ userId: userAuth.id })
      .populate("collegeId", "name")
      .populate("enrolledSubjects", "name");

    res.status(200).json({ success: true, data: { user, student } });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// UPDATE PROFILE
// -------------------------
export const updateStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    const { fullName, collegeName, whatsapp, city, nationality } = req.body;

    const student = await Student.findOneAndUpdate(
      { userId: userAuth.id },
      { name: fullName, collegeName, whatsapp, city, nationality },
      { new: true, runValidators: true }
    ).populate("collegeId", "name");

    if (!student) throw new CustomError("Student profile not found", 404);

    const user = await User.findById(userAuth.id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user, student },
    });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// MATERIALS
// -------------------------
export const getStudentMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    if (userAuth.role !== "STUDENT") throw new CustomError("Forbidden", 403);

    const student = await Student.findOne({ userId: userAuth.id });
    if (!student) throw new CustomError("Student not found", 404);

    const query: any = { status: "APPROVED" };

    if (student.isPublic) {
      query.collegeId = { $exists: false };
    } else {
      query.collegeId = userAuth.collegeId;
      query.subjectId = { $in: student.enrolledSubjects };
    }

    const materials = await Material.find(query).populate("subjectId", "name");
    res.status(200).json({ success: true, data: materials });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// MATERIAL DETAILS
// -------------------------
export const getMaterialDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    const { materialId } = req.params as { materialId: string };

    const student = await Student.findOne({ userId: userAuth.id });
    if (!student) throw new CustomError("Student not found", 404);

    const material = await Material.findById(materialId);
    if (!material || material.status !== "APPROVED")
      throw new CustomError("Material not found", 404);

    if (student.isPublic && material.collegeId)
      throw new CustomError("Forbidden", 403);

    if (!student.isPublic) {
      const enrolled = student.enrolledSubjects
        .map((id) => id.toString())
        .includes(material.subjectId.toString());

      if (material.collegeId?.toString() !== userAuth.collegeId || !enrolled)
        throw new CustomError("Forbidden", 403);
    }

    res.status(200).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// ASK AI
// -------------------------
export const askAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    const { question, materialId } = req.body;

    const student = await Student.findOne({ userId: userAuth.id });
    if (!student) throw new CustomError("Student not found", 404);

    let answer = "";

    if (materialId) {
      const material = await Material.findById(materialId);
      if (!material) throw new CustomError("Material not found", 404);

      const vector = await generateEmbeddings(question);
      const chunks = await searchEmbeddings(vector, 5, material._id);
      const context = chunks.map((c) => c.chunkText).join("\n");

      answer = context
        ? await generateText(`Context:\n${context}\n\nQuestion:\n${question}`)
        : await generateText(question);
    } else {
      answer = await generateText(question);
    }

    await AuditLog.create({
      userId: userAuth.id,
      action: "AI_QUESTION_ASKED",
      details: { question, materialId },
    });

    res.status(200).json({ success: true, data: { answer } });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// QUIZZES
// -------------------------
export const getAvailableQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    const student = await Student.findOne({ userId: userAuth.id });
    if (!student) throw new CustomError("Student not found", 404);

    const query: any = student.isPublic
      ? { collegeId: { $exists: false } }
      : { collegeId: userAuth.collegeId, subjectId: { $in: student.enrolledSubjects } };

    const quizzes = await Quiz.find(query)
      .populate("teacherId", "email")
      .populate("subjectId", "name");

    res.status(200).json({ success: true, data: quizzes });
  } catch (e) {
    next(e);
  }
};

// -------------------------
// SUBMIT QUIZ
// -------------------------
export const submitQuizAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = getUser(req);
    const { quizId } = req.params as { quizId: string };
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);

    const student = await Student.findOne({ userId: userAuth.id });
    if (!student) throw new CustomError("Student not found", 404);

    let score = 0;
    const evaluated = answers.map((a: any) => {
      const q = quiz.questions.find((x) => x.questionText === a.questionText);
      const isCorrect = q?.correctAnswer === a.selectedAnswer;
      if (isCorrect) score++;
      return { ...a, isCorrect };
    });

    const attempt = await QuizAttempt.create({
      studentId: userAuth.id,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      answers: evaluated,
      collegeId: student.isPublic ? undefined : userAuth.collegeId,
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (e) {
    next(e);
  }
};
