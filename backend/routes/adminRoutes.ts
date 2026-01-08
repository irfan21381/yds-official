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
router.get("/users", getAllUsers);               
router.get("/users/:id", getUserById);           
router.post("/users", createUser);               
router.put("/users/:id", updateUser);            
router.delete("/users/:id", deleteUser);         
router.patch("/users/:id/status", updateUserStatus); 

/* =========================
   STUDENT APPROVAL FLOW
========================= */
// 💡 FIXED: Error code line 38 mismatch rakunda ikkada check cheyandi
router.get("/students/pending", getPendingStudents);
router.patch("/students/:id/approve", approveStudent);

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
