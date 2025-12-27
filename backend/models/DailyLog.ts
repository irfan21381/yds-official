import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLog extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  tasksCompleted: string[];
  hoursWorked: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    tasksCompleted: [
      {
        type: String,
      },
    ],
    hoursWorked: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
DailyLogSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
export default DailyLog;

