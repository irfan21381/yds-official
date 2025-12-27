import { Router } from 'express';
import { uploadMaterial, generateQuiz, getTeacherSubjects, getTeacherMaterials, getTeacherAnalytics, getTeacherQuizzes } from '../controllers/teacherController';
import { protect, authorize } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads (for materials)
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|ppt|pptx|doc|docx|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, PPT, DOCX, TXT files are allowed!'));
  },
});

// All teacher routes require TEACHER role
router.use(protect, authorize('TEACHER'));

router.post('/material/upload', upload.single('materialFile'), uploadMaterial);
router.post('/quiz/generate', generateQuiz);
router.get('/subjects', getTeacherSubjects);
router.get('/materials', getTeacherMaterials);
router.get('/analytics', getTeacherAnalytics);
router.get('/quizzes', getTeacherQuizzes);

export default router;
