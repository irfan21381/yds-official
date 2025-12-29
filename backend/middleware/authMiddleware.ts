import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { verifyToken } from "../utils/jwt";
import { CustomError } from "../utils/errorHandler";
import { ROLES } from "../constants/roles";

/* =========================================================
   👤 AUTHENTICATED USER TYPE
   ========================================================= */

export interface AuthenticatedUser {
  id: string;
  role: string;
  collegeId?: string;
}

/* =========================================================
   📦 AUTHENTICATED REQUEST (IMPORTANT FIX)
   ========================================================= */
/**
 * This EXTENDS Express Request correctly
 * so body, params, query, headers ALL EXIST
 */
export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
}

/* =========================================================
   🔐 AUTH MIDDLEWARE
   ========================================================= */

/**
 * Protect routes – verifies JWT and attaches user to req
 */
export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Read token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new CustomError("Not authorized, token missing", 401));
    }

    // Verify token
    const decoded: any = verifyToken(token);

    // Get user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new CustomError("User not found", 401));
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      collegeId: user.collegeId?.toString(),
    };

    next();
  } catch (error) {
    console.error("JWT Error:", error);
    next(new CustomError("Not authorized, invalid token", 401));
  }
};

/* =========================================================
   🔒 ROLE BASED ACCESS
   ========================================================= */

/**
 * Authorize roles
 */
export const authorize =
  (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError("Unauthorized", 401));
    }

    // SUPER ADMIN has full access
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new CustomError(`Access denied for role: ${req.user.role}`, 403)
      );
    }

    next();
  };
