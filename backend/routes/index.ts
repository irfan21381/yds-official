import { Router } from "express";

import authRoutes from "./authRoutes";
import studentRoutes from "./studentRoutes";
import teacherRoutes from "./teacherRoutes";
import managerRoutes from "./managerRoutes";
import adminRoutes from "./adminRoutes";
import statsRoutes from "./statsRoutes"; // ✅ PUBLIC
import aiRoutes from "./aiRoutes";
import internshipRoutes from "./internshipRoutes";
import paymentRoutes from "./paymentRoutes";
import paymentRequestRoutes from "./paymentRequestRoutes";
import salaryPaymentRoutes from "./salaryPaymentRoutes";
import employeeRoutes from "./employeeRoutes";
import contactRoutes from "./contactRoutes";

const router = Router();

// 🌍 PUBLIC FIRST
router.use("/auth", authRoutes);
router.use("/internships", internshipRoutes);
router.use("/stats", statsRoutes); // ✅ PUBLIC (NO protect)

// 🔐 ROLE BASED
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/manager", managerRoutes);
router.use("/admin", adminRoutes);

// OTHERS
router.use("/ai", aiRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-requests", paymentRequestRoutes);
router.use("/salary-payments", salaryPaymentRoutes);
router.use("/employee", employeeRoutes);
router.use("/contact", contactRoutes);

router.get("/", (_req, res) => {
  res.json({ ok: true, message: "YDS API running" });
});

export default router;
