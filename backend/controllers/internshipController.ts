import { Request, Response, NextFunction } from 'express';
import Internship from '../models/Internship';
import InternshipApplication from '../models/InternshipApplication';
import Student from '../models/Student';
import { CustomError } from '../utils/errorHandler';
import AuditLog from '../models/AuditLog';

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
}

interface GetInternshipsQuery {
  collegeId?: string;
}

// GET /api/internships - List all internships (public or filtered by college)
export const getInternships = async (
  req: Request<any, any, any, GetInternshipsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId } = req.query;
    const now = new Date();

    // Build query - show active internships that haven't passed deadline
    const query: {
      isActive: boolean;
      applicationDeadline: { $gte: Date };
      collegeId?: string | { $exists: boolean };
    } = {
      isActive: true,
      applicationDeadline: { $gte: now },
    };

    // If collegeId is provided, filter by it; otherwise show public internships (no collegeId)
    if (collegeId) {
      query.collegeId = collegeId;
    } else {
      query.collegeId = { $exists: false };
    }

    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
      .select('-requirements -skills'); // Exclude detailed fields for list view

    res.status(200).json({
      success: true,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/internships/:id - Get internship details
export const getInternshipById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const internship = await Internship.findById(id);

    if (!internship || !internship.isActive) {
      throw new CustomError('Internship not found', 404);
    }

    // Check if application deadline has passed
    if (internship.applicationDeadline < new Date()) {
      throw new CustomError('Application deadline has passed', 400);
    }

    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/internships/:id/apply - Student applies for internship
export const applyForInternship = async (
  req: AuthenticatedRequest<{ id: string }, any, { coverLetter?: string; resumeUrl?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      throw new CustomError('Only Students can apply for internships', 403);
    }

    const { id } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const internship = await Internship.findById(id);
    if (!internship || !internship.isActive) {
      throw new CustomError('Internship not found', 404);
    }

    // Check if application deadline has passed
    if (internship.applicationDeadline < new Date()) {
      throw new CustomError('Application deadline has passed', 400);
    }

    // Check if student has already applied
    const existingApplication = await InternshipApplication.findOne({
      studentId: req.user.id,
      internshipId: id,
    });

    if (existingApplication) {
      throw new CustomError('You have already applied for this internship', 400);
    }

    // Get student profile
    const studentProfile = await Student.findOne({ userId: req.user.id });
    if (!studentProfile) {
      throw new CustomError('Student profile not found', 404);
    }

    // Create application
    const application = await InternshipApplication.create({
      studentId: req.user.id,
      internshipId: id,
      collegeId: studentProfile.isPublic ? undefined : req.user.collegeId,
      coverLetter,
      resumeUrl,
      status: 'PENDING',
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'INTERNSHIP_APPLIED',
      details: {
        internshipId: id,
        internshipTitle: internship.title,
        applicationId: application._id,
      },
      collegeId: studentProfile.isPublic ? undefined : req.user.collegeId,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/internships/my-applications - Get student's applications
export const getMyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      throw new CustomError('Only Students can view their applications', 403);
    }

    const applications = await InternshipApplication.find({ studentId: req.user.id })
      .populate('internshipId', 'title company location duration stipend applicationDeadline')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};
