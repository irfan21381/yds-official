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
import collegesRoutes from "./collegesRoutes";

const router = Router();

/* =========================================================
   🌍 PUBLIC ROUTES (NO AUTH)
========================================================= */
router.use("/auth", authRoutes);
router.use("/stats", statsRoutes);              // ✅ Public stats
router.use("/internships", internshipRoutes);  // ✅ Public internships
router.use("/contact", contactRoutes);          // ✅ Contact form
router.use("/colleges", collegesRoutes);        // ✅ Public colleges list

/* =========================================================
   🔐 ROLE-BASED ROUTES
========================================================= */
router.use("/student", studentRoutes); // 🔥 REQUIRED for /api/student/subjects
router.use("/teacher", teacherRoutes);
router.use("/manager", managerRoutes);
router.use("/admin", adminRoutes);

/* =========================================================
   🤖 / 💳 / 👨‍💼 OTHER PROTECTED ROUTES
========================================================= */
router.use("/ai", aiRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-requests", paymentRequestRoutes);
router.use("/salary-payments", salaryPaymentRoutes);
router.use("/employee", employeeRoutes);

/* =========================================================
   🌍 API ROOT CHECK
========================================================= */
router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "YDS API running 🚀",
  });
});

export default router;
