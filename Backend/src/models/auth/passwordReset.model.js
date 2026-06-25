import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    emailSentAt: Date,
    lastEmailError: {
      type: String,
      select: false,
    },
    sendCount: {
      type: Number,
      default: 0,
    },
    sendCountWindowStart: Date,
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;
