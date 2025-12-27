import { Request, Response, NextFunction } from 'express';
import { generateText } from '../services/llmService';
import { CustomError } from '../utils/errorHandler';
import AuditLog from '../models/AuditLog';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    collegeId?: string;
  };
}

export const generalAIQuery = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { prompt } = req.body;

  try {
    if (!req.user) {
      throw new CustomError('Authentication required for AI queries', 401);
    }

    // This endpoint is for general AI queries, accessible by all authenticated users.
    // RAG-specific queries are handled in studentController.ts
    const response = await generateText(prompt);

    await AuditLog.create({
      userId: req.user.id,
      action: 'GENERAL_AI_QUERY',
      details: { prompt, responseLength: response.length },
      collegeId: req.user.collegeId,
    });

    res.status(200).json({
      success: true,
      data: { answer: response },
    });
  } catch (error) {
    next(error);
  }
};