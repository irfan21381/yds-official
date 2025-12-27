import { Request, Response, NextFunction } from 'express';
import SalaryPayment from '../models/SalaryPayment';
import Payment from '../models/Payment';
import Employee from '../models/Employee';
import User from '../models/User';
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

// Admin: Create Salary Payment Request
export const createSalaryPayment = async (
  req: AuthenticatedRequest<any, any, { employeeId: string; amount: number; paymentType: string; month?: string; year?: string; description?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can create salary payments', 403);
    }

    const { employeeId, amount, paymentType, month, year, description } = req.body;

    if (!employeeId || !amount || !paymentType) {
      throw new CustomError('Employee ID, amount, and payment type are required', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new CustomError('Employee not found', 404);
    }

    // Convert amount to paise
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `salary_${employeeId}_${Date.now()}`,
      notes: {
        employeeId: employeeId.toString(),
        paymentType,
        month,
        year,
      },
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      userId: employee.userId,
      amount,
      currency: 'INR',
      status: 'PENDING',
      paymentProvider: 'RAZORPAY',
      orderId: order.id,
      planType: 'EMPLOYEE',
      planName: `${paymentType} Payment`,
      metadata: {
        employeeId: employeeId.toString(),
        paymentType,
        month,
        year,
      },
    });

    // Create salary payment record
    const salaryPayment = await SalaryPayment.create({
      employeeId,
      paidBy: req.user.id,
      amount,
      currency: 'INR',
      paymentType,
      month,
      year,
      description,
      paymentId: payment._id,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Salary payment order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        salaryPaymentId: salaryPayment._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Verify Salary Payment
export const verifySalaryPayment = async (
  req: AuthenticatedRequest<{ salaryPaymentId: string }, any, { orderId: string; paymentId: string; signature: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can verify salary payments', 403);
    }

    const { salaryPaymentId } = req.params;
    const { orderId, paymentId, signature } = req.body;

    const salaryPayment = await SalaryPayment.findById(salaryPaymentId);
    if (!salaryPayment) {
      throw new CustomError('Salary payment not found', 404);
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
    const payment = await Payment.findById(salaryPayment.paymentId);
    if (!payment) {
      throw new CustomError('Payment record not found', 404);
    }

    // Update payment status
    payment.status = 'SUCCESS';
    payment.transactionId = paymentId;
    await payment.save();

    // Update salary payment
    salaryPayment.status = 'PAID';
    salaryPayment.paidAt = new Date();
    // TODO: Generate salary slip PDF and update salarySlipUrl
    await salaryPayment.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'SALARY_PAYMENT_COMPLETED',
      details: {
        salaryPaymentId: salaryPayment._id,
        employeeId: salaryPayment.employeeId.toString(),
        amount: salaryPayment.amount,
        paymentType: salaryPayment.paymentType,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Salary payment verified successfully',
      data: {
        salaryPayment,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Salary Payments
export const getAllSalaryPayments = async (
  req: AuthenticatedRequest<any, any, any, { employeeId?: string; status?: string; paymentType?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      throw new CustomError('Only Super Admin can view salary payments', 403);
    }

    const { employeeId, status, paymentType } = req.query;
    const query: any = {};

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;

    const payments = await SalaryPayment.find(query)
      .populate('employeeId', 'employeeId department position')
      .populate('paidBy', 'email')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Employee: Get My Salary Payments
export const getMySalaryPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can view their salary payments', 403);
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const payments = await SalaryPayment.find({ employeeId: employee._id })
      .populate('paidBy', 'email')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
