import mongoose, { Schema, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  superAdminId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    superAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model<ICollege>('College', CollegeSchema);
export default College;