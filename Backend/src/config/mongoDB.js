import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// Windows/ISP DNS often refuses SRV lookups required by mongodb+srv:// URIs.
if (env.mongodbUri.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}

export async function connectDB({ exitOnFailure = true } = {}) {
  try {
    await mongoose.connect(env.mongodbUri);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);

    if (exitOnFailure) {
      process.exit(1);
    }
    throw error;
  }
}
