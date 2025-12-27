import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryPayment extends Document {
  employeeId: mongoose.Types.ObjectId;
  paidBy: mongoose.Types.ObjectId; // Admin who processed payment
  amount: number;
  currency: string;
  paymentType: 'SALARY' | 'STIPEND' | 'BONUS' | 'CUSTOM';
  month?: string; // Format: "2024-01" for salary
  year?: number;
  description?: string;
  paymentId: mongoose.Types.ObjectId; // Reference to Payment
  salarySlipUrl?: string; // PDF URL
  status: 'PENDING' | 'PAID' | 'FAILED';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryPaymentSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    paymentType: {
      type: String,
      enum: ['SALARY', 'STIPEND', 'BONUS', 'CUSTOM'],
      required: true,
    },
    month: {
      type: String,
      match: /^\d{4}-\d{2}$/, // Format: YYYY-MM
    },
    year: {
      type: Number,
    },
    description: {
      type: String,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    salarySlipUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SalaryPaymentSchema.index({ employeeId: 1, month: 1, year: 1 });
SalaryPaymentSchema.index({ paidBy: 1 });
SalaryPaymentSchema.index({ status: 1 });

const SalaryPayment = mongoose.model<ISalaryPayment>('SalaryPayment', SalaryPaymentSchema);
export default SalaryPayment;

