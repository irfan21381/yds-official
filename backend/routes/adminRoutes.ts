import express from "express";
import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getGlobalAnalytics,
  getAllColleges,
  getUsersByRole,
} from "../controllers/adminController";

import {
  getAdminStats,
  updateStats,
} from "../controllers/statsController";

import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

const router = express.Router();

// 🔐 Allow ADMIN & SUPER_ADMIN
router.use(protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// 📊 Analytics (existing – keep this)
router.get("/stats", getAdminStats);       // ✅ admin stats
router.put("/stats", updateStats);         // ✅ update stats

// 🏫 College management
router.post("/college", createCollege);
router.get("/colleges", getAllColleges);
router.post("/college/:collegeId/manager", assignManager);
router.patch("/college/:collegeId/activate", activateDeactivateCollege);

// 👤 User management
router.get("/users", getUsersByRole);

export default router;
