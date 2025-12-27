import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string; // YDS employee ID
  department: string;
  position: string;
  joiningDate: Date;
  tasks: mongoose.Types.ObjectId[]; // References Task model
  dailyLogs: mongoose.Types.ObjectId[]; // References DailyLog model
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    dailyLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DailyLog',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export default Employee;

