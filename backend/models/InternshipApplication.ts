import mongoose, { Schema, Document } from 'mongoose';

export interface IInternshipApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  internshipId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // Manager or admin who reviewed
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipApplicationSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
    },
    coverLetter: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
InternshipApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });
InternshipApplicationSchema.index({ internshipId: 1, status: 1 });
InternshipApplicationSchema.index({ studentId: 1, status: 1 });

const InternshipApplication = mongoose.model<IInternshipApplication>('InternshipApplication', InternshipApplicationSchema);
export default InternshipApplication;

