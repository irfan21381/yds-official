import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId?: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentProvider: 'RAZORPAY' | 'STRIPE';
  orderId: string;
  transactionId?: string;
  planType: 'STUDENT' | 'COLLEGE' | 'TEACHER' | 'EMPLOYEE';
  planName: string;
  planDuration: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentProvider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE'],
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
    },
    planType: {
      type: String,
      enum: ['STUDENT', 'COLLEGE', 'TEACHER', 'EMPLOYEE'],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planDuration: {
      type: String,
      enum: ['MONTHLY', 'YEARLY', 'LIFETIME'],
      default: 'MONTHLY',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ collegeId: 1, status: 1 });
PaymentSchema.index({ orderId: 1 }, { unique: true });
PaymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;

