import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../src/models/admin/admin.model.js";
import { ROLES } from "../src/constant/roles.js";

dotenv.config({ quiet: true });

const mongodbUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

async function seed() {
  if (!mongodbUri) {
    console.error("MONGODB_URI or MONGODB_URL is required");
    process.exit(1);
  }

  const email = process.env.SEED_SUPERADMIN_EMAIL;
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  const username = process.env.SEED_SUPERADMIN_USERNAME || "superadmin";

  if (!email || !password) {
    console.error("SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD are required");
    process.exit(1);
  }

  await mongoose.connect(mongodbUri);

  const existing = await Admin.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) {
    console.log("Super admin already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  await Admin.create({
    username,
    email,
    password,
    role: ROLES.SUPER_ADMIN,
    status: "active",
    createdBy: null,
  });

  console.log("Super admin created:", email);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
