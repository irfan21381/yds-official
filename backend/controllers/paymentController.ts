import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';
import User from '../models/User';
import College from '../models/College';
import { CustomError } from '../utils/errorHandler';
import AuditLog from '../models/AuditLog';
// @ts-ignore
import Razorpay = require('razorpay');
import * as crypto from 'crypto';

interface AuthenticatedUser {
  id: string;
  role: string;
  collegeId?: string;
}

interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
}

// Lazy initialization of Razorpay - only when needed
let razorpayInstance: any = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new CustomError('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.', 500);
    }
    
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// Create Razorpay Order
export const createRazorpayOrder = async (
  req: AuthenticatedRequest<any, any, { amount: number; planName: string; planType: string; planDuration?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, planName, planType, planDuration } = req.body;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!amount || !planName || !planType) {
      throw new CustomError('Amount, plan name, and plan type are required', 400);
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${req.user.id}`,
      notes: {
        userId: req.user.id,
        planName,
        planType,
        planDuration: planDuration || 'MONTHLY',
      },
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      collegeId: req.user.collegeId,
      amount,
      currency: 'INR',
      status: 'PENDING',
      paymentProvider: 'RAZORPAY',
      orderId: order.id,
      planType,
      planName,
      planDuration: planDuration || 'MONTHLY',
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = async (
  req: AuthenticatedRequest<any, any, { orderId: string; paymentId: string; signature: string; planName: string; planType: string; planDuration?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, paymentId, signature, planName, planType, planDuration } = req.body;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new CustomError('Razorpay key secret not configured', 500);
    }
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new CustomError('Invalid payment signature', 400);
    }

    // Find payment record
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new CustomError('Payment record not found', 404);
    }

    // Update payment status
    payment.status = 'SUCCESS';
    payment.transactionId = paymentId;
    await payment.save();

    // Create or update subscription
    const subscriptionData: any = {
      userId: req.user.id,
      collegeId: req.user.collegeId,
      planName,
      planType,
      planDuration: planDuration || 'MONTHLY',
      status: 'ACTIVE',
      paymentId: payment._id,
      startDate: new Date(),
      autoRenew: false,
    };

    // Set end date based on duration
    if (planDuration === 'MONTHLY') {
      subscriptionData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (planDuration === 'YEARLY') {
      subscriptionData.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // Set AI credits and features based on plan
    if (planType === 'STUDENT') {
      subscriptionData.aiCredits = 999999; // Unlimited for paid students
      subscriptionData.features = {
        unlimitedAI: true,
        resumeBuilder: true,
        certificates: true,
        internshipPriority: true,
      };
    } else if (planType === 'COLLEGE') {
      subscriptionData.aiCredits = 999999; // Unlimited for colleges
      subscriptionData.features = {
        unlimitedAI: true,
        bulkStudentManagement: true,
        advancedAnalytics: true,
      };
    }

    const subscription = await Subscription.create(subscriptionData);

    // Generate invoice
    const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoice = await Invoice.create({
      invoiceNo,
      userId: req.user.id,
      collegeId: req.user.collegeId,
      paymentId: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      planName,
      planType,
      pdfUrl: `/invoices/${invoiceNo}.pdf`, // Will be generated by invoice service
    });

    // Log activity
    await AuditLog.create({
      userId: req.user.id,
      action: 'PAYMENT_SUCCESS',
      details: {
        paymentId: payment._id,
        orderId,
        planName,
        amount: payment.amount,
      },
      collegeId: req.user.collegeId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment,
        subscription,
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Payment History
export const getPaymentHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    let payments;
    if (req.user.role === 'SUPER_ADMIN') {
      // Super admin sees all payments
      payments = await Payment.find({}).sort({ createdAt: -1 }).limit(100);
    } else if (req.user.role === 'MANAGER' && req.user.collegeId) {
      // Manager sees college payments
      payments = await Payment.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    } else {
      // User sees their own payments
      payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get Subscription Status
export const getSubscriptionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    let subscription;
    if (req.user.collegeId) {
      subscription = await Subscription.findOne({
        collegeId: req.user.collegeId,
        status: 'ACTIVE',
      });
    } else {
      subscription = await Subscription.findOne({
        userId: req.user.id,
        status: 'ACTIVE',
      });
    }

    // If no subscription, return default free plan
    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'FREE',
          aiCredits: 20, // Free tier credits
          aiCreditsUsed: 0,
          features: {
            unlimitedAI: false,
            resumeBuilder: false,
            certificates: false,
            internshipPriority: false,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get Invoices
export const getInvoices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    let invoices;
    if (req.user.role === 'SUPER_ADMIN') {
      invoices = await Invoice.find({}).sort({ issuedAt: -1 });
    } else if (req.user.collegeId) {
      invoices = await Invoice.find({ collegeId: req.user.collegeId }).sort({ issuedAt: -1 });
    } else {
      invoices = await Invoice.find({ userId: req.user.id }).sort({ issuedAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};
