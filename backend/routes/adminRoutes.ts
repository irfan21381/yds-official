import express from "express";
import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getAllColleges,
  getUsersByRole,
  getPendingStudents,
  approveStudent,
} from "../controllers/adminController";

import {
  getAdminStats,
  updateStats,
} from "../controllers/statsController";

import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

const router = express.Router();

/* =========================
   AUTH
========================= */
router.use(protect, authorize(ROLES.SUPER_ADMIN));

/* =========================
   STATS
========================= */
router.get("/stats", getAdminStats);
router.put("/stats", updateStats);

/* =========================
   COLLEGE MANAGEMENT
========================= */
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

/* =========================
   USER MANAGEMENT
========================= */
router.get("/users", getUsersByRole);

/* =========================
   STUDENT APPROVAL (NEW)
========================= */
router.get("/students/pending", getPendingStudents);
router.post("/students/:userId/approve", approveStudent);

export default router;
