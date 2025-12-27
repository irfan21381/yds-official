import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string; // e.g., 'COLLEGE_CREATED', 'MATERIAL_UPLOADED', 'QUIZ_ATTEMPTED'
  details: Record<string, any>; // JSON object with relevant details
  collegeId?: mongoose.Types.ObjectId; // Optional, for college-scoped actions
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed, // Flexible object for various details
      default: {},
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;