import { Router } from 'express';
import {
  getEmployeeProfile,
  getEmployeeTasks,
  updateTaskStatus,
  createDailyLog,
  getDailyLogs,
  createEmployee,
  assignTask,
} from '../controllers/employeeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Employee routes (protected - EMPLOYEE role)
router.get('/profile', protect, authorize('EMPLOYEE'), getEmployeeProfile);
router.get('/tasks', protect, authorize('EMPLOYEE'), getEmployeeTasks);
router.patch('/tasks/:taskId', protect, authorize('EMPLOYEE'), updateTaskStatus);
router.post('/daily-logs', protect, authorize('EMPLOYEE'), createDailyLog);
router.get('/daily-logs', protect, authorize('EMPLOYEE'), getDailyLogs);

// Admin/Manager routes for employee management
router.post('/create', protect, authorize('SUPER_ADMIN', 'MANAGER'), createEmployee);
router.post('/assign-task', protect, authorize('SUPER_ADMIN', 'MANAGER'), assignTask);

export default router;

