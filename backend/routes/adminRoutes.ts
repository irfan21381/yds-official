import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getAllColleges,
  getAllUsers, // ✅ Import the new controller
} from "../controllers/adminController";

import {
  getPendingStudents,
  approveStudent,
} from "../controllers/adminStudentController";

const router = express.Router();

// Auth Protection
router.use(protect, authorize(ROLES.SUPER_ADMIN));

/* =========================
    USER DATABASE ROUTES
========================= */
// Step 1 Approval list
router.get("/students/pending", getPendingStudents);
router.patch("/students/:studentId/approve", approveStudent);

// ✅ NEW: Full user database access
router.get("/users/all", getAllUsers); 

/* =========================
    COLLEGE MANAGEMENT
========================= */
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

export default router;
