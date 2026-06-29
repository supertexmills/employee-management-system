import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ quiet: true });

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

const otpPepperState = { ephemeral: false };

function resolveOtpPepper() {
  const pepper = process.env.OTP_PEPPER?.trim();
  if (pepper) {
    if (pepper.length < 32) {
      throw new Error("OTP_PEPPER must be at least 32 characters");
    }
    return pepper;
  }

  if (nodeEnv === "production") {
    throw new Error("OTP_PEPPER is required in production");
  }

  otpPepperState.ephemeral = true;
  return crypto.randomBytes(32).toString("hex");
}

export const env = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  rfidEnabled: process.env.RFID_ENABLED === "true",
  rfidReaderIp: process.env.RFID_READER_IP || "192.168.1.200",
  rfidReaderPort: Number(process.env.RFID_READER_PORT) || 200,
  rfidReaderId: process.env.RFID_READER_ID || "GATE_1",
  rfidLocation: process.env.RFID_LOCATION || "Main Gate",
  rfidReaderPollMs: Number(process.env.RFID_READER_POLL_MS) || 500,
  factoryTimezone: process.env.FACTORY_TIMEZONE || "Asia/Kolkata",
  defaultMinRoundIntervalSeconds: Number(process.env.DEFAULT_MIN_ROUND_INTERVAL_SECONDS) || 1,
  countOutsideShift: process.env.COUNT_OUTSIDE_SHIFT === "true",
  emailProvider: process.env.EMAIL_PROVIDER || "smtp",
  emailFromName: process.env.EMAIL_FROM_NAME?.trim() || "SuperTex Mills",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS?.trim() || null,
  smtpUser: process.env.SMTP_USER?.trim() || null,
  smtpPass: process.env.SMTP_PASS?.replace(/\s/g, "") || null,
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT) || 465,
  smtpSecure: process.env.SMTP_SECURE !== "false",
  smtpConnectionTimeoutMs: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 8_000,
  smtpGreetingTimeoutMs: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 8_000,
  otpPepper: resolveOtpPepper(),
  otpPepperEphemeral: otpPepperState.ephemeral,
  redisUrl: process.env.REDIS_URL?.trim() || null,
};

if (env.isProduction) {
  if (!env.smtpUser || !env.smtpPass) {
    throw new Error("SMTP_USER and SMTP_PASS are required in production");
  }
  if (!env.redisUrl) {
    throw new Error("REDIS_URL is required in production");
  }
}
