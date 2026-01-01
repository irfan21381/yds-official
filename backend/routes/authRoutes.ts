import { Router } from "express";
import {
  register,
  login,
  resetPasswordWithOTP,
  changePassword,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   PUBLIC
========================= */
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPasswordWithOTP);

/* =========================
   PROTECTED
========================= */
router.post("/change-password", protect, changePassword);

export default router;
