import mongoose from "mongoose";
import { DEPARTMENTS, SHIFTS } from "../../constant/factory.js";

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
      index: true,
    },
    defaultShift: {
      type: String,
      enum: SHIFTS,
      default: "morning",
    },
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    minRoundIntervalSeconds: {
      type: Number,
      default: 30,
      min: 30,
    },
    targetRoundsPerShift: {
      type: Number,
      default: null,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

machineSchema.index({ department: 1, isActive: 1 });
machineSchema.index({ reader: 1 });

const Machine = mongoose.model("Machine", machineSchema);
export default Machine;
