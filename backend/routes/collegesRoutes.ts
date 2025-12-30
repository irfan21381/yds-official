import express from "express";
import { getAllColleges } from "../controllers/adminController";

const router = express.Router();

// 🌍 PUBLIC – Homepage colleges
router.get("/", getAllColleges);

export default router;
