import { Router } from "express";
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  resetPasswordWithOTP,
  changePassword,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.post("/register", register);
router.post("/login", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPasswordWithOTP);

/* =========================
   PROTECTED ROUTES
========================= */
router.post("/change-password", protect, changePassword);

export default router;
