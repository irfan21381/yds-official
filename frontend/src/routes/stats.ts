import { Router } from "express";

const router = Router();

// ✅ PUBLIC STATS API
router.get("/", (_req, res) => {
  res.status(200).json({
    colleges: 42,
    students: 1200,
    internships: 85,
    products: 12,
  });
});

export default router;
