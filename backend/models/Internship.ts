import mongoose, { Schema, Document } from 'mongoose';

export interface IInternship extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  duration: string; // e.g., "3 months", "6 months"
  stipend?: number;
  requirements: string[];
  skills: string[];
  applicationDeadline: Date;
  startDate: Date;
  isActive: boolean;
  collegeId?: mongoose.Types.ObjectId; // Optional - can be public or college-specific
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    stipend: {
      type: Number,
    },
    requirements: [{
      type: String,
    }],
    skills: [{
      type: String,
    }],
    applicationDeadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
InternshipSchema.index({ isActive: 1, applicationDeadline: 1 });
InternshipSchema.index({ collegeId: 1 });

const Internship = mongoose.model<IInternship>('Internship', InternshipSchema);
export default Internship;

