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
      match: /^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/,
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
