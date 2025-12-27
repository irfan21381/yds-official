import { Router } from 'express';
import {
  createSalaryPayment,
  verifySalaryPayment,
  getAllSalaryPayments,
  getMySalaryPayments,
} from '../controllers/salaryPaymentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Admin routes
router.post('/create', protect, authorize('SUPER_ADMIN'), createSalaryPayment);
router.post('/:salaryPaymentId/verify', protect, authorize('SUPER_ADMIN'), verifySalaryPayment);
router.get('/all', protect, authorize('SUPER_ADMIN'), getAllSalaryPayments);

// Employee routes
router.get('/my-payments', protect, authorize('EMPLOYEE'), getMySalaryPayments);

export default router;
