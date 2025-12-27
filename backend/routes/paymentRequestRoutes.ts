import { Router } from 'express';
import {
  createPaymentRequest,
  getAllPaymentRequests,
  cancelPaymentRequest,
  getMyPaymentRequests,
  createPaymentRequestOrder,
  verifyPaymentRequestPayment,
  getPaymentHistory,
} from '../controllers/paymentRequestController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Admin routes
router.post('/create', protect, authorize('SUPER_ADMIN'), createPaymentRequest);
router.get('/all', protect, authorize('SUPER_ADMIN'), getAllPaymentRequests);
router.patch('/:requestId/cancel', protect, authorize('SUPER_ADMIN'), cancelPaymentRequest);

// Student routes
router.get('/my-requests', protect, authorize('STUDENT', 'PUBLIC_STUDENT'), getMyPaymentRequests);
router.get('/history', protect, authorize('STUDENT', 'PUBLIC_STUDENT'), getPaymentHistory);
router.post('/:requestId/create-order', protect, authorize('STUDENT', 'PUBLIC_STUDENT'), createPaymentRequestOrder);
router.post('/:requestId/verify', protect, authorize('STUDENT', 'PUBLIC_STUDENT'), verifyPaymentRequestPayment);

export default router;
