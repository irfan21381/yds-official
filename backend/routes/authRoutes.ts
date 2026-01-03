import { Router } from "express";
import {
  registerStudent,
  loginUser,
  checkAccountStatus,
} from "../controllers/authController";

const router = Router();

/* ========= PUBLIC ========= */
router.post("/register", registerStudent);
router.post("/login", loginUser);
router.get("/check-status", checkAccountStatus);

export default router;
