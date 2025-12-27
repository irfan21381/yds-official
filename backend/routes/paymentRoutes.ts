import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentHistory,
  getSubscriptionStatus,
  getInvoices,
} from '../controllers/paymentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All payment routes require authentication
router.use(protect);

// Razorpay routes
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Subscription and payment history
router.get('/history', getPaymentHistory);
router.get('/subscription', getSubscriptionStatus);
router.get('/invoices', getInvoices);

export default router;
