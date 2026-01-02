import { Router } from "express";
import {
  registerStudent,
  loginUser,
  checkAccountStatus,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   PUBLIC ROUTES
========================= */

// Student Registration (email + password only)
router.post("/register", registerStudent);

// Student / Admin Login
router.post("/login", loginUser);

// Check account status by email (for homepage)
router.get("/check-status", checkAccountStatus);

/* =========================
   PROTECTED ROUTES
========================= */

// (Optional – future use)

//router.post("/change-password", protect, changePassword);

export default router;
