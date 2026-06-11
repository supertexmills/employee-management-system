import dotenv from "dotenv";

dotenv.config();

const required = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not set`);
  }
}

const mongodbUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!mongodbUri) {
  throw new Error("Environment variable MONGODB_URI or MONGODB_URL is not set");
}

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  isProduction: nodeEnv === "production",
};
