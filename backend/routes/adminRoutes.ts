import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

/* ===== CONTROLLERS ===== */
import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getAllColleges,
  getAllUsers // ✅ New controller import
} from "../controllers/adminController";

import {
  getPendingStudents,
  approveStudent,
} from "../controllers/adminStudentController";

const router = express.Router();

/* =========================
   AUTH (SUPER ADMIN ONLY)
========================= */
router.use(protect, authorize(ROLES.SUPER_ADMIN));

/* =========================
   STUDENT APPROVAL (STEP-1)
========================= */
router.get("/students/pending", getPendingStudents);
router.patch("/students/:studentId/approve", approveStudent);

/* =========================
   USER DATABASE (FULL DATA)
========================= */
// ✅ New route for viewing all users, including emails and passwords
router.get("/users/all", getAllUsers); 

/* =========================
   COLLEGE MANAGEMENT
========================= */
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

export default router;
