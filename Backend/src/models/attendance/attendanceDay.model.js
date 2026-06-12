import mongoose from "mongoose";

const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "INSIDE",
  "EXITED",
  "LATE",
  "OVERTIME",
  "MISSING_TAG",
  "UNAUTHORIZED",
];

const attendanceDaySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: ["morning", "evening", "night"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      required: true,
      default: "ABSENT",
      index: true,
    },
    firstEntryAt: {
      type: Date,
      default: null,
    },
    lastExitAt: {
      type: Date,
      default: null,
    },
    currentState: {
      type: String,
      enum: ["OUTSIDE", "INSIDE", "EXITED"],
      default: "OUTSIDE",
    },
    totalInsideMinutes: {
      type: Number,
      default: 0,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    isOvertime: {
      type: Boolean,
      default: false,
    },
    flags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attendanceDaySchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceDaySchema.index({ date: 1, status: 1, department: 1, shift: 1 });

export { ATTENDANCE_STATUSES };

const AttendanceDay = mongoose.model("AttendanceDay", attendanceDaySchema);
export default AttendanceDay;
