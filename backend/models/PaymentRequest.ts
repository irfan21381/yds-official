import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // Admin who created the request
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: 'COURSE_COMPLETION' | 'INTERNSHIP_COMPLETION' | 'REGISTRATION' | 'WORKSHOP' | 'TRAINING' | 'PENDING_DUES' | 'MISSING_FEE' | 'OTHER';
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  relatedCourseId?: mongoose.Types.ObjectId; // If course completion fee
  relatedInternshipId?: mongoose.Types.ObjectId; // If internship completion fee
  paymentId?: mongoose.Types.ObjectId; // Reference to Payment when paid
  dueDate?: Date;
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    type: {
      type: String,
      enum: ['COURSE_COMPLETION', 'INTERNSHIP_COMPLETION', 'REGISTRATION', 'WORKSHOP', 'TRAINING', 'PENDING_DUES', 'MISSING_FEE', 'OTHER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'CANCELLED'],
      default: 'PENDING',
    },
    relatedCourseId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    },
    relatedInternshipId: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
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
PaymentRequestSchema.index({ studentId: 1, status: 1 });
PaymentRequestSchema.index({ createdBy: 1 });
PaymentRequestSchema.index({ type: 1, status: 1 });

const PaymentRequest = mongoose.model<IPaymentRequest>('PaymentRequest', PaymentRequestSchema);
export default PaymentRequest;

