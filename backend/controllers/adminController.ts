import { Request, Response, NextFunction } from 'express';
import College from '../models/College';
import User from '../models/User';
import Material from '../models/Material';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import Embedding from '../models/Embedding';
import { CustomError } from '../utils/errorHandler';
import { generateOTP, sendOTPEmail } from '../utils/otp';
import AuditLog from '../models/AuditLog';

/* ===========================================================
    ✅ FIXED AUTHENTICATED REQUEST (IMPORTANT FOR RENDER)
=========================================================== */
export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    role: string;
    collegeId?: string;
  };
}

/* ===========================================================
    SUPER ADMIN → GET ALL USERS (FULL DATA AUDIT)
=========================================================== */
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can view the full database', 403);
    }

    // Fetches all users and explicitly includes the hashed password field
    const users = await User.find()
      .select('+password') 
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: users.length,
      data: users 
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================================================
    SUPER ADMIN → CREATE COLLEGE
=========================================================== */
export const createCollege = async (
  req: AuthenticatedRequest<any, any, { name: string }>,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can create colleges', 403);
    }
    const exists = await College.findOne({ name });
    if (exists) throw new CustomError('College already exists', 400);

    const college = await College.create({
      name,
      superAdminId: req.user.id,
      isActive: true
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'COLLEGE_CREATED',
      details: { collegeId: college._id, name }
    });

    res.status(201).json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

/* ===========================================================
    SUPER ADMIN → ASSIGN MANAGER
=========================================================== */
export const assignManager = async (
  req: AuthenticatedRequest<any, any, { collegeId: string; managerEmail: string }>,
  res: Response,
  next: NextFunction
) => {
  const { collegeId, managerEmail } = req.body;
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can assign managers', 403);
    }
    const college = await College.findById(collegeId);
    if (!college) throw new CustomError('College not found', 404);

    let managerUser = await User.findOne({ email: managerEmail });
    if (managerUser) {
      if (managerUser.role === 'MANAGER' && managerUser.collegeId?.toString() === collegeId) {
        throw new CustomError('This user is already manager of this college', 400);
      }
      managerUser.role = 'MANAGER';
      managerUser.collegeId = college._id;
      managerUser.isVerified = false;
      delete (managerUser as any).password;
      await managerUser.save();
    } else {
      managerUser = await User.create({
        email: managerEmail,
        role: 'MANAGER',
        collegeId,
        isVerified: false
      });
    }

    const otp = generateOTP();
    managerUser.otpSecret = otp;
    managerUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await managerUser.save();
    await sendOTPEmail(managerUser.email, otp);

    await AuditLog.create({
      userId: req.user.id,
      action: 'MANAGER_ASSIGNED',
      details: { managerEmail, managerId: managerUser._id, collegeId }
    });

    res.status(200).json({
      success: true,
      message: `Manager assigned to ${college.name}. OTP sent.`,
      data: managerUser
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================================================
    SUPER ADMIN → ACTIVATE / DEACTIVATE COLLEGE
=========================================================== */
export const activateDeactivateCollege = async (
  req: AuthenticatedRequest<{ collegeId: string }, any, { isActive: boolean }>,
  res: Response,
  next: NextFunction
) => {
  const { collegeId } = req.params;
  const { isActive } = req.body;
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can modify colleges', 403);
    }
    const college = await College.findByIdAndUpdate(collegeId, { isActive }, { new: true });
    if (!college) throw new CustomError('College not found', 404);

    await AuditLog.create({
      userId: req.user.id,
      action: isActive ? 'COLLEGE_ACTIVATED' : 'COLLEGE_DISABLED',
      details: { collegeId, isActive }
    });

    res.status(200).json({
      success: true,
      message: `College ${college.name} has been ${isActive ? 'activated' : 'deactivated'}.`,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================================================
    SUPER ADMIN → GET ALL COLLEGES / ANALYTICS
=========================================================== */
export const getAllColleges = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') throw new CustomError('Forbidden', 403);
    const colleges = await College.find();
    res.status(200).json({ success: true, data: colleges });
  } catch (error) { next(error); }
};

export const getGlobalAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') throw new CustomError('Forbidden', 403);
    const analytics = {
      colleges: await College.countDocuments(),
      totalUsers: await User.countDocuments(),
      students: await User.countDocuments({ role: 'STUDENT' }),
    };
    res.status(200).json({ success: true, data: analytics });
  } catch (error) { next(error); }
};
