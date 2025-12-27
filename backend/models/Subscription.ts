import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId?: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  planName: string;
  planType: 'STUDENT' | 'COLLEGE' | 'TEACHER' | 'EMPLOYEE';
  planDuration: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentId: mongoose.Types.ObjectId;
  aiCredits: number; // AI credits available
  aiCreditsUsed: number; // AI credits used
  features: {
    unlimitedAI: boolean;
    resumeBuilder: boolean;
    certificates: boolean;
    internshipPriority: boolean;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    planName: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      enum: ['STUDENT', 'COLLEGE', 'TEACHER', 'EMPLOYEE'],
      required: true,
    },
    planDuration: {
      type: String,
      enum: ['MONTHLY', 'YEARLY', 'LIFETIME'],
      default: 'MONTHLY',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    aiCredits: {
      type: Number,
      default: 0,
    },
    aiCreditsUsed: {
      type: Number,
      default: 0,
    },
    features: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ collegeId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });

const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export default Subscription;

