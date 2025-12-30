import { Router } from "express";
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  changePassword,
  resetPasswordWithOTP,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.post("/register", register);
router.post("/login", login);

// 🔥 OTP LOGIN (EMAIL BASED)
router.post("/send-otp", sendOtp);       // SEND OTP TO EMAIL
router.post("/verify-otp", verifyOtp);   // VERIFY OTP

// Forgot password (OTP based)
router.post("/reset-password", resetPasswordWithOTP);

/* =========================
   PROTECTED ROUTES
========================= */
router.post("/change-password", protect, changePassword);

export default router;