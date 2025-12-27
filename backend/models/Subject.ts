import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  collegeId?: mongoose.Types.ObjectId; // Made optional to support public subjects
  teacherIds: mongoose.Types.ObjectId[]; // Teachers assigned to this subject
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      // No longer strictly required, allowing for public subjects
    },
    teacherIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to User model, specifically teachers
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;