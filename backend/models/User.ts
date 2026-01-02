import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;

  role:
    | "SUPER_ADMIN"
    | "MANAGER"
    | "TEACHER"
    | "STUDENT"
    | "EMPLOYEE"
    | "PUBLIC_STUDENT";

  collegeId?: mongoose.Types.ObjectId;

  // 🔐 OTP (ADMIN ONLY – OPTIONAL)
  otpSecret?: string;
  otpExpires?: Date;

  // 🔥 TEMP PASSWORD FLAG (OPTIONAL USE)
  isTempPassword: boolean;

  // ✅ ACCOUNT APPROVAL STATUS
  status: "PENDING" | "APPROVED";

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
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please use a valid email address"],
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔐 NEVER expose password
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "MANAGER",
        "TEACHER",
        "STUDENT",
        "EMPLOYEE",
        "PUBLIC_STUDENT",
      ],
      required: true,
    },

    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: function () {
        return this.role === "MANAGER";
      },
    },

    // 🔐 OTP (ADMIN ONLY)
    otpSecret: String,
    otpExpires: Date,

    // 🔥 TEMP PASSWORD FLAG
    isTempPassword: {
      type: Boolean,
      default: false,
    },

    // ✅ APPROVAL STATUS
    status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   🔐 PASSWORD HASH
====================================================== */
UserSchema.pre("save", async function (next) {
  const user = this as any;

  if (!user.isModified("password")) return next();

  if (!user.password || typeof user.password !== "string") {
    return next(new Error("Password must be a valid string"));
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

/* ======================================================
   🔑 PASSWORD MATCH
====================================================== */
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
