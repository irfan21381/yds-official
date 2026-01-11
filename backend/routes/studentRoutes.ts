import { Router } from "express";
import {
  getStudentMaterials,
  getMaterialDetails,
  getAvailableQuizzes,
  getQuizById,
  submitQuizAttempt,
  getStudentEnrolledSubjects,
  getStudentMe,
  getStudentStats,
  getStudentActivity,
  updateStudentProfile,
} from "../controllers/studentController";

import {
  getMyApplications,
  applyForInternship,
} from "../controllers/internshipController";

import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

/* 🔐 Protect ALL student routes */
router.use(protect, authorize("STUDENT", "PUBLIC_STUDENT"));

/* 👤 Profile */
router.get("/me", getStudentMe);
router.put("/me", updateStudentProfile);

/* 📊 Dashboard */
router.get("/stats", getStudentStats);
router.get("/activity", getStudentActivity);

/* 📘 Subjects */
router.get("/subjects", getStudentEnrolledSubjects);

/* 📚 Materials */
router.get("/materials", getStudentMaterials);
router.get("/materials/:materialId", getMaterialDetails);

/* 📝 Quizzes */
router.get("/quizzes", getAvailableQuizzes);
router.get("/quizzes/:quizId", getQuizById);
router.post("/quizzes/:quizId/submit", submitQuizAttempt);

/* 🎓 Internships */
router.get("/internships", getMyApplications);
router.post("/internships/apply", applyForInternship);

export default router;
