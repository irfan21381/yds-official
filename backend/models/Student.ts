import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  studentNumber?: string;
  year?: number;
  branch?: string;
  enrolledSubjects: mongoose.Types.ObjectId[];

  // 🔥 NEW FIELDS
  name?: string;
  whatsapp?: string;
  city?: string;
  nationality?: string;
  collegeName?: string;

  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
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
      required: function () {
        return !this.isPublic;
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    studentNumber: String,
    year: Number,
    branch: String,
    enrolledSubjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],

    // 🔥 NEW FIELDS — These allow saving profile
    name: String,
    whatsapp: String,
    city: String,
    nationality: String,
    collegeName: String,
  },
  { timestamps: true }
);

const Student = mongoose.model<IStudent>('Student', StudentSchema);
export default Student;
