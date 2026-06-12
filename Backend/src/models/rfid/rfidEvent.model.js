import mongoose from "mongoose";

const rfidEventSchema = new mongoose.Schema(
  {
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
    action: {
      type: String,
      enum: ["ENTRY", "EXIT", "UNKNOWN"],
      required: true,
    },
    readerId: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    rawHex: {
      type: String,
      default: "",
    },
    detectedAt: {
      type: Date,
      required: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

rfidEventSchema.index({ epc: 1, detectedAt: -1 });
rfidEventSchema.index({ employee: 1, detectedAt: -1 });

const RfidEvent = mongoose.model("RfidEvent", rfidEventSchema);
export default RfidEvent;
