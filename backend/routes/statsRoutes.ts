import express from "express";
import { getPublicStats } from "../controllers/statsController";

const router = express.Router();

// 🌍 PUBLIC – NO AUTH
router.get("/", getPublicStats);

export default router;
