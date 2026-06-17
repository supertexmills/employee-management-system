import mongoose from "mongoose";
import { connectDB } from "../../src/config/mongoDB.js";

export async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    await connectDB({ exitOnFailure: false });
  }
}

export async function clearDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnectTestDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
