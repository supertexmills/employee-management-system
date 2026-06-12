import mongoose from "mongoose";

const shiftScheduleSchema = new mongoose.Schema(
  {
    shift: {
      type: String,
      enum: ["morning", "evening", "night"],
      required: true,
      unique: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    graceMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    overtimeAfterMinutes: {
      type: Number,
      default: 30,
      min: 0,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ShiftSchedule = mongoose.model("ShiftSchedule", shiftScheduleSchema);
export default ShiftSchedule;
