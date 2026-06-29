import mongoose from "mongoose";
import { DEPARTMENTS, SHIFTS } from "../../constant/factory.js";

const hourlyRoundSchema = new mongoose.Schema(
  {
    hourIndex: { type: Number, required: true },
    hourLabel: { type: String, required: true, trim: true },
    rounds: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const machineShiftSummarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
      index: true,
    },
    machineId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: SHIFTS,
      required: true,
      index: true,
    },
    factoryDate: {
      type: String,
      required: true,
      index: true,
    },
    shiftStartAt: {
      type: Date,
      required: true,
    },
    shiftEndAt: {
      type: Date,
      required: true,
    },
    totalRounds: {
      type: Number,
      default: 0,
      min: 0,
    },
    hourlyRounds: {
      type: [hourlyRoundSchema],
      default: [],
    },
    roundsThisHour: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentHourIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRoundAt: {
      type: Date,
      default: null,
    },
    targetRoundsPerShift: {
      type: Number,
      default: null,
      min: 0,
    },
    achievementPercent: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

machineShiftSummarySchema.index(
  { employee: 1, machineId: 1, factoryDate: 1, shift: 1 },
  { unique: true }
);
machineShiftSummarySchema.index({ factoryDate: 1, shift: 1, department: 1, machineId: 1 });

const MachineShiftSummary = mongoose.model("MachineShiftSummary", machineShiftSummarySchema);
export default MachineShiftSummary;
