import mongoose from "mongoose";
import { READER_TYPES } from "../../constant/factory.js";

const readerSchema = new mongoose.Schema(
  {
    readerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: READER_TYPES,
      default: "MACHINE",
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      default: null,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pollIntervalMs: {
      type: Number,
      default: 500,
      min: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
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

readerSchema.index({ type: 1, isActive: 1 });

const Reader = mongoose.model("Reader", readerSchema);
export default Reader;
