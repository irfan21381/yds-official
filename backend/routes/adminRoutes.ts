import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getAllColleges,
  getGlobalAnalytics,
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
   USER MANAGEMENT
========================= */
// ✅ MAIN ROUTE (REST STANDARD)
router.get("/users", getAllUsers);

// ✅ BACKWARD COMPATIBILITY (FIXES /users/all 500 ERROR)
router.get("/users/all", getAllUsers);

router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/status", updateUserStatus);

/* =========================
   STUDENT APPROVAL
========================= */
router.get("/students/pending", getPendingStudents);
router.patch("/students/:studentId/approve", approveStudent);

/* =========================
   COLLEGE MANAGEMENT
========================= */
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

/* =========================
   ANALYTICS
========================= */
router.get("/analytics", getGlobalAnalytics);

export default router;
