import mongoose from "mongoose";
import { DEPARTMENTS, SHIFTS, ROUND_SOURCES } from "../../constant/factory.js";

const machineRoundSchema = new mongoose.Schema(
  {
    roundKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    epc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
      default: "Unknown",
    },
    employeeId: {
      type: String,
      default: null,
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
    readerId: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      default: null,
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
    shiftHourIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    shiftHourLabel: {
      type: String,
      required: true,
      trim: true,
    },
    detectedAt: {
      type: Date,
      required: true,
      index: true,
    },
    withinShift: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ROUND_SOURCES,
      default: "TCP",
    },
    rawHex: {
      type: String,
      default: "",
    },
    rejectedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

machineRoundSchema.index({ machineId: 1, detectedAt: -1 });
machineRoundSchema.index({ employee: 1, factoryDate: 1, machineId: 1 });
machineRoundSchema.index({ factoryDate: 1, shift: 1, department: 1 });

const MachineRound = mongoose.model("MachineRound", machineRoundSchema);
export default MachineRound;
