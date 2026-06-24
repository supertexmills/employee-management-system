import mongoose from "mongoose";
import {
  ROUND_SOURCES,
  TAG_PROCESSED_STATES,
  TAG_REJECT_REASONS,
} from "../../constant/factory.js";

const rawTagEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    readerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    epc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    rssi: {
      type: Number,
      default: null,
    },
    antennaId: {
      type: Number,
      default: null,
    },
    rawHex: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ROUND_SOURCES,
      default: "TCP",
    },
    location: {
      type: String,
      default: null,
    },
    detectedAt: {
      type: Date,
      required: true,
      index: true,
    },
    processed: {
      type: String,
      enum: TAG_PROCESSED_STATES,
      default: "pending",
      index: true,
    },
    rejectedReason: {
      type: String,
      enum: TAG_REJECT_REASONS,
      default: null,
    },
    roundKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

rawTagEventSchema.index({ readerId: 1, detectedAt: -1 });
rawTagEventSchema.index({ epc: 1, detectedAt: -1 });

const RawTagEvent = mongoose.model("RawTagEvent", rawTagEventSchema);
export default RawTagEvent;
