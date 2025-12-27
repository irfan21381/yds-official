import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId; // Made optional to support public teachers
  subjects: mongoose.Types.ObjectId[]; // References Subject model
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      // No longer strictly required, allowing for public teachers
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
export default Teacher;