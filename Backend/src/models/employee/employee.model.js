import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      immutable: true,
      index: true,
      required: true,
    },
    profilePicture: {
        type: String,
        trim: true,
        default: null
      },

    employeeName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
     },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: /^[0-9]{10}$/,
      },

      department: {
        type: String,
        required: true,
        enum: [
            "Production",
            "Quality",
            "Maintenance",
            "HR",
            "Accounts",
            "Store"
          ]
      },
      
      designation: {
        type: String,
        required: true,
        trim: true,
      },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        
    },

    joinedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    rfid: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    shift: {
        type: String,
        enum: [
          "morning",
          "evening",
          "night"
        ],
        required: true
      },

    isActive: {
      type: Boolean,
      default: true,
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


employeeSchema.index({ department: 1 });
employeeSchema.index({ createdBy: 1 });
employeeSchema.index({
    department: 1,
    isActive: 1
 });

const Employee = mongoose.model("Employee",employeeSchema);
export default Employee;
