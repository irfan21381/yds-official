import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

import {
  // USER MANAGEMENT
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,

  // COLLEGE MANAGEMENT
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
   USER MANAGEMENT (CRUD)
========================= */
router.get("/users", getAllUsers);               // list users
router.get("/users/:id", getUserById);           // view details
router.post("/users", createUser);               // add EMP / STUDENT
router.put("/users/:id", updateUser);            // update user
router.delete("/users/:id", deleteUser);         // delete user
router.patch("/users/:id/status", updateUserStatus); // activate/deactivate

/* =========================
   STUDENT APPROVAL FLOW
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