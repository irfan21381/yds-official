import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";

import {
  createCollege,
  assignManager,
  activateDeactivateCollege,
  getAllColleges,
} from "../controllers/adminController";

import {
  getAdminStats,
  updateStats,
} from "../controllers/statsController";

const router = express.Router();

/* =========================
   AUTH (SUPER ADMIN ONLY)
========================= */
router.use(protect, authorize(ROLES.SUPER_ADMIN));

/* =========================
   DASHBOARD STATS
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

export default router;
