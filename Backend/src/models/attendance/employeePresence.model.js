import mongoose from "mongoose";

const employeePresenceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },
    epc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    currentState: {
      type: String,
      enum: ["INSIDE", "OUTSIDE"],
      required: true,
      default: "OUTSIDE",
    },
    lastAction: {
      type: String,
      enum: ["ENTRY", "EXIT"],
      default: null,
    },
    lastEventAt: {
      type: Date,
      default: null,
    },
    lastReaderId: {
      type: String,
      default: null,
    },
    lastLocation: {
      type: String,
      default: null,
    },
    todayFirstEntryAt: {
      type: Date,
      default: null,
    },
    todayDate: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

employeePresenceSchema.index({ currentState: 1, todayDate: 1 });

const EmployeePresence = mongoose.model("EmployeePresence", employeePresenceSchema);
export default EmployeePresence;
