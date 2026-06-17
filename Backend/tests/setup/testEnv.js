import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { inject } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

dotenv.config({ path: path.join(root, ".env.test"), override: true });

try {
  const mongoUri = inject("mongoUri");
  if (mongoUri) {
    process.env.MONGODB_URI = mongoUri;
  }
} catch {
  // inject is unavailable outside the test worker
}

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test-placeholder";
}
