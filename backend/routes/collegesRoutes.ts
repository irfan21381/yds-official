import express from "express";
import { getPublicColleges } from "../controllers/collegeController";

const router = express.Router();

// 🌍 PUBLIC
router.get("/", getPublicColleges);

export default router;
