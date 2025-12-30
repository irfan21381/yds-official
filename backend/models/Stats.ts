import mongoose, { Schema, Document } from "mongoose";

export interface IStats extends Document {
  colleges: number;
  students: number;
  internships: number;
  products: number;
}

const StatsSchema = new Schema<IStats>(
  {
    colleges: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    internships: { type: Number, default: 0 },
    products: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// SINGLE DOCUMENT MODEL
export default mongoose.model<IStats>("Stats", StatsSchema);
