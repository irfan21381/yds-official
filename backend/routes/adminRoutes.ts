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
import { getPendingStudents, approveStudent } from "../controllers/adminStudentController";

const router = express.Router();

router.use(protect, authorize(ROLES.SUPER_ADMIN));

/* 👤 User Management */
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser); // 👈 Line 40: Now correctly finds updateUser callback
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/status", updateUserStatus);

/* 🎓 Student Approval */
router.get("/students/pending", getPendingStudents);
router.patch("/students/:studentId/approve", approveStudent);

/* 🏛️ College & Analytics */
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.get("/analytics", getGlobalAnalytics);

export default router;
