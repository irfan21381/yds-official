import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  submissionText?: string;
  attachments?: string[]; // File URLs
  submittedAt: Date;
  marksObtained?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSubmissionSchema: Schema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submissionText: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    marksObtained: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'LATE'],
      default: 'SUBMITTED',
    },
  },
  {
    timestamps: true,
  }
);

// Index - one submission per student per assignment
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model<IAssignmentSubmission>('AssignmentSubmission', AssignmentSubmissionSchema);
export default AssignmentSubmission;

