import { Router } from "express";

import authRoutes from "./authRoutes";
import studentRoutes from "./studentRoutes";
import teacherRoutes from "./teacherRoutes";
import managerRoutes from "./managerRoutes";
import adminRoutes from "./adminRoutes";
import aiRoutes from "./aiRoutes";
import internshipRoutes from "./internshipRoutes";
import paymentRoutes from "./paymentRoutes";
import paymentRequestRoutes from "./paymentRequestRoutes";
import salaryPaymentRoutes from "./salaryPaymentRoutes";
import employeeRoutes from "./employeeRoutes";
import contactRoutes from "./contactRoutes";

// ✅ NEW: Public stats routes
import statsRoutes from "./statsRoutes";

const router = Router();

// ---------------- PUBLIC ROUTES ----------------
router.use("/auth", authRoutes);
router.use("/internships", internshipRoutes);
router.use("/stats", statsRoutes); // 🌍 PUBLIC STATS (Homepage)

// ---------------- ROLE BASED ROUTES ----------------
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/manager", managerRoutes);
router.use("/admin", adminRoutes); // 🔐 ADMIN (Protected)

// ---------------- OTHER ROUTES ----------------
router.use("/ai", aiRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-requests", paymentRequestRoutes);
router.use("/salary-payments", salaryPaymentRoutes);
router.use("/employee", employeeRoutes);
router.use("/contact", contactRoutes);

// ---------------- ROOT HEALTH ----------------
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "YDS API running",
  });
});

export default router;
