import mongoose from "mongoose";

const factorySettingsSchema = new mongoose.Schema(
  {
    _key: {
      type: String,
      default: "singleton",
      unique: true,
      immutable: true,
    },
    rfidEnabled: {
      type: Boolean,
      default: false,
    },
    factoryTimezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },
    defaultMinRoundIntervalSeconds: {
      type: Number,
      default: 1,
      min: 1,
    },
    countOutsideShift: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FactorySettings = mongoose.model("FactorySettings", factorySettingsSchema);
export default FactorySettings;
