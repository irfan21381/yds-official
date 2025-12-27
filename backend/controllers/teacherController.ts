import { Request, Response, NextFunction } from "express";
import Material from "../models/Material";
import Subject from "../models/Subject";
import Quiz from "../models/Quiz";
import cloudinary from "../config/cloudinary";
import { CustomError } from "../utils/errorHandler";
import fs from "fs";
import { extractTextFromFile, chunkText } from "../utils/fileProcessor";
import { generateEmbeddings } from "../services/embeddingService";
import { storeEmbeddings } from "../services/vectorService";
import { generateQuizFromText, generateText } from "../services/llmService";
import AuditLog from "../models/AuditLog";
import Embedding from "../models/Embedding";
import QuizAttempt from "../models/QuizAttempt";

interface AuthenticatedUser {
  id: string;
  role: string;
  collegeId?: string;
}

interface AuthReq<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
  file?: Express.Multer.File;
}

/* ============================================================
   📌 UPLOAD MATERIAL
============================================================ */
export const uploadMaterial = async (
  req: AuthReq<any, any, { title: string; description?: string; subjectId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") {
      throw new CustomError("Only teachers can upload materials", 403);
    }

    if (!req.file) throw new CustomError("No file uploaded", 400);

    const { title, description, subjectId } = req.body;
    const subject = await Subject.findById(subjectId);

    if (!subject) throw new CustomError("Subject not found", 404);

    // College teacher → only upload inside own college
    if (req.user.collegeId && subject.collegeId && subject.collegeId.toString() !== req.user.collegeId) {
      throw new CustomError("Subject does not belong to your college", 403);
    }

    // Public teacher → can only upload to public subjects
    if (!req.user.collegeId && subject.collegeId) {
      throw new CustomError("Public teachers can upload only to public subjects", 403);
    }

    // Upload to cloudinary
    const folder = req.user.collegeId
      ? `yds/materials/${req.user.collegeId}/${req.user.id}`
      : `yds/materials/public/${req.user.id}`;

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: "auto",
    });

    const material = await Material.create({
      title,
      description,
      fileType: req.file.mimetype,
      fileUrl: upload.secure_url,
      teacherId: req.user.id,
      subjectId,
      collegeId: req.user.collegeId || undefined,
      status: "PENDING",
    });

    // Auto-ingest
    const text = await extractTextFromFile(req.file.path, req.file.mimetype);
    const chunks = chunkText(text);
    const vectors = await Promise.all(chunks.map(c => generateEmbeddings(c)));
    await storeEmbeddings(material._id, chunks, vectors);

    // Remove local file
    fs.unlinkSync(req.file.path);

    await AuditLog.create({
      userId: req.user.id,
      action: "MATERIAL_UPLOADED",
      details: { materialId: material._id },
      collegeId: req.user.collegeId,
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};

/* ============================================================
   📌 GENERATE QUIZ FROM MATERIAL OR TOPIC
============================================================ */
export const generateQuiz = async (
  req: AuthReq<any, any, { materialId?: string; subjectId: string; title: string; description?: string; numQuestions: number; generalTopic?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") {
      throw new CustomError("Only teachers can generate quizzes", 403);
    }

    const { materialId, subjectId, title, description, numQuestions, generalTopic } = req.body;

    let sourceText = "";
    let sourceMaterialId: string | undefined;

    // Case A: Quiz from material
    if (materialId) {
      const material = await Material.findById(materialId);
      if (!material || material.teacherId.toString() !== req.user.id)
        throw new CustomError("Unauthorized material access", 403);

      if (req.user.collegeId && material.collegeId && material.collegeId.toString() !== req.user.collegeId)
        throw new CustomError("Material not from your college", 403);

      if (!material.status || material.status !== "APPROVED")
        throw new CustomError("Only approved materials allowed", 400);

      const emb = await Embedding.find({ materialId }).select("chunkText");
      if (!emb.length) throw new CustomError("No ingested text found", 400);

      sourceText = emb.map(e => e.chunkText).join(" ");
      sourceMaterialId = materialId;
    }

    // Case B: Quiz from general topic
    if (!materialId && generalTopic) {
      sourceText = await generateText(
        `Explain the topic "${generalTopic}" deeply for creating a student quiz.`
      );
    }

    if (!sourceText) throw new CustomError("No source text to generate quiz", 400);

    const subject = await Subject.findById(subjectId);
    if (!subject) throw new CustomError("Subject not found", 404);

    if (req.user.collegeId && subject.collegeId && subject.collegeId.toString() !== req.user.collegeId)
      throw new CustomError("Subject not from your college", 403);

    const quizQuestions = await generateQuizFromText(sourceText, numQuestions);

    const quiz = await Quiz.create({
      title,
      description,
      questions: quizQuestions,
      teacherId: req.user.id,
      subjectId,
      materialId: sourceMaterialId,
      collegeId: req.user.collegeId || undefined,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: "QUIZ_GENERATED",
      details: { quizId: quiz._id, subjectId },
      collegeId: req.user.collegeId,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   📌 GET TEACHER SUBJECTS
============================================================ */
export const getTeacherSubjects = async (
  req: AuthReq,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") throw new CustomError("Unauthorized", 403);

    const query: any = { teacherIds: req.user.id };
    query.collegeId = req.user.collegeId || { $exists: false };

    const subjects = await Subject.find(query);
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   📌 GET TEACHER MATERIALS
============================================================ */
export const getTeacherMaterials = async (
  req: AuthReq,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") throw new CustomError("Unauthorized", 403);

    const query: any = { teacherId: req.user.id };
    query.collegeId = req.user.collegeId || { $exists: false };

    const materials = await Material.find(query).populate("subjectId", "name");
    res.json({ success: true, data: materials });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   📌 TEACHER ANALYTICS
============================================================ */
export const getTeacherAnalytics = async (
  req: AuthReq,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") throw new CustomError("Unauthorized", 403);

    const teacherId = req.user.id;
    const collegeId = req.user.collegeId;

    const filter: any = { teacherId };
    const quizFilter: any = { teacherId };

    filter.collegeId = collegeId || { $exists: false };
    quizFilter.collegeId = collegeId || { $exists: false };

    const totalMaterials = await Material.countDocuments({ ...filter, status: "APPROVED" });
    const pendingMaterials = await Material.countDocuments({ ...filter, status: "PENDING" });
    const totalQuizzes = await Quiz.countDocuments(quizFilter);

    const quizIds = await Quiz.find(quizFilter).distinct("_id");
    const totalAttempts = await QuizAttempt.countDocuments({ quizId: { $in: quizIds } });

    const studentPerformance: any[] = [];

    res.json({
      success: true,
      data: {
        totalMaterials,
        pendingMaterials,
        totalQuizzes,
        totalAttempts,
        studentPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   📌 GET ALL QUIZZES BY TEACHER
============================================================ */
export const getTeacherQuizzes = async (
  req: AuthReq,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "TEACHER") throw new CustomError("Unauthorized", 403);

    const query: any = { teacherId: req.user.id };
    query.collegeId = req.user.collegeId || { $exists: false };

    const quizzes = await Quiz.find(query).populate("subjectId", "name");
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
};
