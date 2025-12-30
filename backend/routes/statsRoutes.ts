import { Router } from "express";
import { getPublicStats } from "../controllers/statsController";

const router = Router();

// 🌍 PUBLIC STATS
router.get("/", getPublicStats);

export default router;
