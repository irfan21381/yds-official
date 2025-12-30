import express from "express";
import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getGlobalAnalytics,
  getAllColleges,
  getUsersByRole,
  getAdminStats,
  updateStats
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

const router = express.Router();

// Allow both ADMIN and SUPER_ADMIN
router.use(protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// Analytics
router.get("/stats", getGlobalAnalytics);

// College management
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

// User management
router.get("/users", getUsersByRole);

export default router;
