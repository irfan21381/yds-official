import { Request, Response, NextFunction } from 'express';
import PaymentRequest from '../models/PaymentRequest';
import Payment from '../models/Payment';
import User from '../models/User';
import Student from '../models/Student';
import { CustomError } from '../utils/errorHandler';
import AuditLog from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
// @ts-ignore
import Razorpay = require('razorpay');
import * as crypto from 'crypto';

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

// Admin: Create Payment Request
export const createPaymentRequest = async (
  req: AuthenticatedRequest<any, any, { studentId: string; title: string; description?: string; amount: number; type: string; relatedCourseId?: string; relatedInternshipId?: string; dueDate?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can create payment requests', 403);
    }

    const { studentId, title, description, amount, type, relatedCourseId, relatedInternshipId, dueDate } = req.body;

    if (!studentId || !title || !amount || !type) {
      throw new CustomError('Student ID, title, amount, and type are required', 400);
    }

    // Verify student exists
    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      throw new CustomError('Student not found', 404);
    }

    const paymentRequest = await PaymentRequest.create({
      studentId,
      createdBy: req.user.id,
      title,
      description,
      amount,
      currency: 'INR',
      type,
      relatedCourseId,
      relatedInternshipId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'PENDING',
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'PAYMENT_REQUEST_CREATED',
      details: {
        paymentRequestId: paymentRequest._id,
        studentId,
        amount,
        type,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment request created successfully',
      data: paymentRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Payment Requests
export const getAllPaymentRequests = async (
  req: AuthenticatedRequest<any, any, any, { status?: string; type?: string; studentId?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can view all payment requests', 403);
    }

    const { status, type, studentId } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.studentId = studentId;

    const requests = await PaymentRequest.find(query)
      .populate('studentId', 'email')
      .populate('createdBy', 'email')
      .populate('relatedCourseId', 'name')
      .populate('relatedInternshipId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Cancel Payment Request
export const cancelPaymentRequest = async (
  req: AuthenticatedRequest<{ requestId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can cancel payment requests', 403);
    }

    const { requestId } = req.params;
    const request = await PaymentRequest.findById(requestId);

    if (!request) {
      throw new CustomError('Payment request not found', 404);
    }

    if (request.status === 'PAID') {
      throw new CustomError('Cannot cancel a paid request', 400);
    }

    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Payment request cancelled',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Student: Get My Payment Requests
export const getMyPaymentRequests = async (
  req: AuthenticatedRequest<any, any, any, { status?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'PUBLIC_STUDENT')) {
      throw new CustomError('Only students can view their payment requests', 403);
    }

    const { status } = req.query;
    const query: any = { studentId: req.user.id };

    if (status) query.status = status;

    const requests = await PaymentRequest.find(query)
      .populate('createdBy', 'email')
      .populate('relatedCourseId', 'name')
      .populate('relatedInternshipId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Student: Create Razorpay Order for Payment Request
export const createPaymentRequestOrder = async (
  req: AuthenticatedRequest<{ requestId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'PUBLIC_STUDENT')) {
      throw new CustomError('Only students can pay for payment requests', 403);
    }

    const { requestId } = req.params;
    const request = await PaymentRequest.findById(requestId);

    if (!request) {
      throw new CustomError('Payment request not found', 404);
    }

    if (request.studentId.toString() !== req.user.id) {
      throw new CustomError('Not authorized to pay this request', 403);
    }

    if (request.status !== 'PENDING') {
      throw new CustomError('Payment request is not pending', 400);
    }

    // Convert amount to paise
    const amountInPaise = Math.round(request.amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `payment_request_${requestId}_${Date.now()}`,
      notes: {
        paymentRequestId: requestId,
        studentId: req.user.id,
        type: request.type,
      },
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      amount: request.amount,
      currency: 'INR',
      status: 'PENDING',
      paymentProvider: 'RAZORPAY',
      orderId: order.id,
      planType: 'STUDENT',
      planName: request.title,
      metadata: {
        paymentRequestId: requestId,
        type: request.type,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student: Verify Payment Request Payment
export const verifyPaymentRequestPayment = async (
  req: AuthenticatedRequest<{ requestId: string }, any, { orderId: string; paymentId: string; signature: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'PUBLIC_STUDENT')) {
      throw new CustomError('Only students can verify payments', 403);
    }

    const { requestId } = req.params;
    const { orderId, paymentId, signature } = req.body;

    const request = await PaymentRequest.findById(requestId);
    if (!request) {
      throw new CustomError('Payment request not found', 404);
    }

    if (request.studentId.toString() !== req.user.id) {
      throw new CustomError('Not authorized', 403);
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

    // Update payment request
    request.status = 'PAID';
    request.paymentId = payment._id;
    request.paidAt = new Date();
    await request.save();

    // Log activity
    await AuditLog.create({
      userId: req.user.id,
      action: 'PAYMENT_REQUEST_PAID',
      details: {
        paymentRequestId: requestId,
        paymentId: payment._id,
        amount: request.amount,
        type: request.type,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        request,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student: Get Payment History
export const getPaymentHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'PUBLIC_STUDENT')) {
      throw new CustomError('Only students can view payment history', 403);
    }

    const requests = await PaymentRequest.find({
      studentId: req.user.id,
      status: 'PAID',
    })
      .populate('createdBy', 'email')
      .populate('paymentId')
      .sort({ paidAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};
