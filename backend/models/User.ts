import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;   // <- MUST be string, not optional
  role: 'SUPER_ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'EMPLOYEE' | 'PUBLIC_STUDENT';
  collegeId?: mongoose.Types.ObjectId;
  otpSecret?: string;
  otpExpires?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please use a valid email address'],
    },

    password: {
      type: String,
      required: false, // allow empty initially
    },

    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'EMPLOYEE', 'PUBLIC_STUDENT'],
      required: true,
    },

    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: function () {
        return this.role === 'MANAGER';
      },
    },

    otpSecret: String,
    otpExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------------
// SAFEST PASSWORD HASH FIX
// ----------------------------
UserSchema.pre('save', async function (next) {
  const user = this as any;

  if (!user.isModified('password')) return next();

  if (!user.password || typeof user.password !== 'string') {
    return next(new Error("Password must be a string"));
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
