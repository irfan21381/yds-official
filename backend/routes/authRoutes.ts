import { Router } from "express";
import {
  registerStudent,
  loginUser,
  checkAccountStatus,
} from "../controllers/authController";

const router = Router();

/* =========================
   🌍 PUBLIC ROUTES
========================= */

/**
 * Student Registration
 * - email + password only
 * - status = PENDING
 * - no OTP
 */
router.post("/register", registerStudent);

/**
 * Login (Admin + Student)
 * - blocks PENDING users
 * - allows ACTIVE users
 */
router.post("/login", loginUser);

/**
 * Check account status
 * - used on homepage
 * - tells user if account exists / pending / active
 */
router.get("/check-status", checkAccountStatus);

/* =========================
   🔐 PROTECTED ROUTES
========================= */
/**
 * (Reserved for future use)
 * Example:
 * router.post("/change-password", protect, changePassword);
 */

export default router;
