import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/mongoDB.js";
import Admin from "../src/models/admin/admin.model.js";
import Employee from "../src/models/employee/employee.model.js";
import { ROLES } from "../src/constant/roles.js";

dotenv.config();

const EMPLOYEES = [
  {
    employeeName: "Arun Kumar",
    phoneNumber: "9876543210",
    department: "Production",
    designation: "Machine Operator",
    rfid: "E28068940000402ED4B57CEC",
    shift: "morning",
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  },
  {
    employeeName: "Priya Sharma",
    phoneNumber: "9876543211",
    department: "Quality",
    designation: "QC Inspector",
    rfid: "E28068940000502ED4B58C55",
    shift: "morning",
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600002" },
  },
  {
    employeeName: "Ravi Menon",
    phoneNumber: "9876543212",
    department: "Maintenance",
    designation: "Technician",
    rfid: "E28068940000502ED4B78D41",
    shift: "evening",
    address: { city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
  },
  {
    employeeName: "Sneha Patel",
    phoneNumber: "9876543213",
    department: "HR",
    designation: "HR Executive",
    rfid: "E28068940000402ED4B570B5",
    shift: "morning",
    address: { city: "Madurai", state: "Tamil Nadu", pincode: "625001" },
  },
  {
    employeeName: "Karthik Reddy",
    phoneNumber: "9876543214",
    department: "Accounts",
    designation: "Accountant",
    rfid: "E28068940000402ED4B5A048",
    shift: "evening",
    address: { city: "Salem", state: "Tamil Nadu", pincode: "636001" },
  },
  {
    employeeName: "Divya Iyer",
    phoneNumber: "9876543215",
    department: "Store",
    designation: "Store Keeper",
    rfid: "E28068940000402ED4B5D18D",
    shift: "morning",
    address: { city: "Trichy", state: "Tamil Nadu", pincode: "620001" },
  },
  {
    employeeName: "Mohammed Ali",
    phoneNumber: "9876543216",
    department: "Production",
    designation: "Shift Supervisor",
    rfid: "E28068940000402ED4B82956",
    shift: "night",
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600003" },
  },
  {
    employeeName: "Lakshmi Devi",
    phoneNumber: "9876543217",
    department: "Quality",
    designation: "Lab Analyst",
    rfid: "E28068940000402ED4B974D8",
    shift: "evening",
    address: { city: "Erode", state: "Tamil Nadu", pincode: "638001" },
  },
  {
    employeeName: "Suresh Babu",
    phoneNumber: "9876543218",
    department: "Maintenance",
    designation: "Electrician",
    rfid: "E28068940000402ED4B6809D",
    shift: "morning",
    address: { city: "Vellore", state: "Tamil Nadu", pincode: "632001" },
  },
  {
    employeeName: "Anitha Nair",
    phoneNumber: "9876543219",
    department: "Production",
    designation: "Assembly Worker",
    rfid: "E28068940000502ED4B6541B",
    shift: "evening",
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600004" },
  },
];

async function seed() {
  await connectDB();

  const admin = await Admin.findOne({ role: ROLES.SUPER_ADMIN });
  if (!admin) {
    console.error("No super admin found. Run first: pnpm run seed:superadmin");
    await mongoose.disconnect();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const emp of EMPLOYEES) {
    const exists = await Employee.findOne({
      $or: [{ rfid: emp.rfid }, { phoneNumber: emp.phoneNumber }],
    });

    if (exists) {
      console.log(`Skipped (already exists): ${emp.employeeName} / ${emp.rfid}`);
      skipped++;
      continue;
    }

    await Employee.create({
      ...emp,
      joinedDate: new Date(),
      createdBy: admin._id,
    });

    console.log(`Created: ${emp.employeeName} → ${emp.rfid}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
