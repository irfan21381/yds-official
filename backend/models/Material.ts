import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string; // e.g., 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId; // Made optional for public materials
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // For manager approval
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
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
      // No longer strictly required, allowing for public materials
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Material = mongoose.model<IMaterial>('Material', MaterialSchema);
export default Material;