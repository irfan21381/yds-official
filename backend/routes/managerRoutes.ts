import { Router } from "express";
import {
  addTeacher,
  addStudent,
  uploadStudentsCSV,
  approveMaterial,
  getCollegeAnalytics,
  getSubjectsForCollege,
  getPendingMaterialsForCollege,
  createSubject,
} from "../controllers/managerController";
import { protect, authorize } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

/* =========================
   Ensure uploads directory
   ========================= */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   Multer config
   ========================= */
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      path.extname(file.originalname).toLowerCase() === ".csv";

    if (isCsv) return cb(null, true);
    cb(new Error("Only CSV files are allowed"));
  },
});

/* =========================
   Routes (middleware INLINE)
   ========================= */
router.post(
  "/teacher",
  protect,
  authorize("MANAGER"),
  addTeacher
);

router.post(
  "/student",
  protect,
  authorize("MANAGER"),
  addStudent
);

router.post(
  "/upload-csv",
  protect,
  authorize("MANAGER"),
  upload.single("studentsCsv"),
  uploadStudentsCSV
);

router.put(
  "/approve-material/:materialId",
  protect,
  authorize("MANAGER"),
  approveMaterial
);

router.get(
  "/analytics",
  protect,
  authorize("MANAGER"),
  getCollegeAnalytics
);

router.get(
  "/subjects",
  protect,
  authorize("MANAGER"),
  getSubjectsForCollege
);

router.post(
  "/subject",
  protect,
  authorize("MANAGER"),
  createSubject
);

router.get(
  "/materials/pending",
  protect,
  authorize("MANAGER"),
  getPendingMaterialsForCollege
);

export default router;
