import mongoose from "mongoose";

const securityAuditSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    emailHash: {
      type: String,
      index: true,
    },
    ip: String,
    userAgent: String,
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const SecurityAudit = mongoose.model("SecurityAudit", securityAuditSchema);
export default SecurityAudit;
