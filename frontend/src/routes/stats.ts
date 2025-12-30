import { Router } from "express";
import { getPublicStats } from "../controllers/statsController";

const router = Router();

// PUBLIC
router.get("/", getPublicStats);

export default router;
