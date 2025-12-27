import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNo: string;
  userId?: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  planName: string;
  planType: string;
  pdfUrl: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    planName: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InvoiceSchema.index({ invoiceNo: 1 }, { unique: true });
InvoiceSchema.index({ userId: 1 });
InvoiceSchema.index({ collegeId: 1 });

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;

