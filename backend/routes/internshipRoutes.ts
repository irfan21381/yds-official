import { Router } from "express";
import {
  getInternships,
  getInternshipById,
  applyForInternship,
  getMyApplications,
} from "../controllers/internshipController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

// Public routes - anyone can view internships
router.get("/", getInternships);
router.get("/:id", getInternshipById);

// Protected routes - only students can apply
router.post("/:id/apply", protect, authorize("STUDENT"), applyForInternship);
router.get("/my-applications", protect, authorize("STUDENT"), getMyApplications);

export default router;

