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
  rfidEnabled: process.env.RFID_ENABLED === "true",
  rfidReaderIp: process.env.RFID_READER_IP || "192.168.1.200",
  rfidReaderPort: Number(process.env.RFID_READER_PORT) || 200,
  rfidReaderId: process.env.RFID_READER_ID || "GATE_1",
  rfidLocation: process.env.RFID_LOCATION || "Main Gate",
  rfidReaderPollMs: Number(process.env.RFID_READER_POLL_MS) || 500,
  rfidDuplicateMs: Number(process.env.RFID_DUPLICATE_MS) || 2000,
  rfidAntiPassbackMs: Number(process.env.RFID_ANTI_PASSBACK_MS) || 30000,
  factoryTimezone: process.env.FACTORY_TIMEZONE || "Asia/Kolkata",
  missingTagThresholdMinutes: Number(process.env.MISSING_TAG_THRESHOLD_MINUTES) || 90,
  productionModeOnly: process.env.PRODUCTION_MODE_ONLY === "true",
  defaultMinRoundIntervalSeconds: Number(process.env.DEFAULT_MIN_ROUND_INTERVAL_SECONDS) || 30,
  countOutsideShift: process.env.COUNT_OUTSIDE_SHIFT === "true",
};
