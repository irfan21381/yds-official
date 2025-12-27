import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  dueDate: Date;
  maxMarks: number;
  attachments?: string[]; // File URLs
  submissions: mongoose.Types.ObjectId[]; // References AssignmentSubmission
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    submissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AssignmentSubmission',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
AssignmentSchema.index({ teacherId: 1 });
AssignmentSchema.index({ subjectId: 1 });
AssignmentSchema.index({ collegeId: 1, dueDate: 1 });

const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;

