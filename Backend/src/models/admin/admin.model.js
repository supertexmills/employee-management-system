import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { ROLES } from "../../constant/roles.js";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role required"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
  },
  { timestamps: true }
);

adminSchema.index({ role: 1, status: 1 });

adminSchema.pre("save", async function () {
  this.isActive = this.status === "active";
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

adminSchema.methods.comparePassword = function (candidate) {
  return comparePassword(candidate, this.password);
};

adminSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    status: this.status,
    isActive: this.isActive,
    profilePicture: this.profilePicture,
    lastLoginAt: this.lastLoginAt,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
