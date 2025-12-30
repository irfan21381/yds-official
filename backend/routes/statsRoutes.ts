import express from "express";
import { getGlobalAnalytics } from "../controllers/adminController";

const router = express.Router();

// 🌍 PUBLIC READ-ONLY STATS
router.get("/", getGlobalAnalytics);

export default router;
