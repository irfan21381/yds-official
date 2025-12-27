import { Router } from "express";
import { 
  register as registerUser,
  login as loginUser,
  sendOtp,
  verifyOtp,
  changePassword,
  resetPasswordWithOTP,
} from "../controllers/authController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPasswordWithOTP); // Reset password with OTP (forgot password flow)

// Protected
router.post("/change-password", protect, changePassword); // Change password when logged in

export default router;
