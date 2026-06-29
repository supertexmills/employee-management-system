import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

// Windows/ISP DNS often refuses SRV lookups required by mongodb+srv:// URIs.
if (env.mongodbUri.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}

export async function connectDB({ exitOnFailure = true } = {}) {
  try {
    await mongoose.connect(env.mongodbUri);

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error({ err: error.message }, "MongoDB connection failed");

    if (exitOnFailure) {
      process.exit(1);
    }
    throw error;
  }
}
