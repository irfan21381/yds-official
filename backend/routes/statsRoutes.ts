import express from "express";
import { getPublicStats } from "../controllers/statsController";

const router = express.Router();

// 🌍 PUBLIC HOMEPAGE STATS
router.get("/", getPublicStats);

export default router;
