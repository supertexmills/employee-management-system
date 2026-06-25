import Admin from "../models/admin/admin.model.js";
import PasswordReset from "../models/auth/passwordReset.model.js";
import { AppError } from "../utils/AppError.js";
import { issueTokenPair, verifyToken } from "../utils/token.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import { assertCanCreateUser } from "./rbac.service.js";
import { enqueuePasswordResetEmail } from "../jobs/email.queue.js";
import {
  logSecurityEvent,
  SECURITY_EVENTS,
} from "./securityAudit.service.js";
import {
  GENERIC_RESET_MESSAGE,
  MAX_OTP_ATTEMPTS,
  MAX_OTP_SENDS_PER_24H,
  OTP_EXPIRES_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_SEND_WINDOW_MS,
  PASSWORD_RESET_ALLOWED_ROLES,
} from "../constant/passwordReset.js";

async function saveRefreshToken(user, refreshToken) {
  user.refreshToken = await hashPassword(refreshToken);
  await user.save();
}

export async function login(email, password) {
  const user = await Admin.findOne({ email }).select("+password +refreshToken");
  if (!user || user.status !== "active") {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = issueTokenPair(user);
  user.lastLoginAt = new Date();
  await saveRefreshToken(user, tokens.refreshToken);

  return { user: user.toSafeObject(), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  const decoded = verifyToken(refreshToken, "refresh");
  const user = await Admin.findById(decoded.sub).select("+refreshToken");
  if (!user || user.status !== "active" || !user.refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  if (decoded.tv !== (user.tokenVersion ?? 0)) {
    throw new AppError("Token revoked", 401);
  }

  const valid = await comparePassword(refreshToken, user.refreshToken);
  if (!valid) {
    user.refreshToken = null;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
    throw new AppError("Token revoked", 401);
  }

  const tokens = issueTokenPair(user);
  await saveRefreshToken(user, tokens.refreshToken);

  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function logout(userId) {
  const user = await Admin.findById(userId).select("+refreshToken");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.refreshToken = null;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();
}

export async function registerUser(actor, body) {
  assertCanCreateUser(actor, body.role);

  const exists = await Admin.findOne({
    $or: [{ email: body.email }, { username: body.username }],
  });
  if (exists) {
    throw new AppError("Email or username already exists", 409);
  }

  const user = await Admin.create({
    username: body.username,
    email: body.email,
    password: body.password,
    role: body.role,
    status: "active",
    createdBy: actor._id,
  });

  return user.toSafeObject();
}

export async function getMe(userId) {
  const user = await Admin.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.toSafeObject();
}

export async function updateProfile(userId, updates) {
  const user = await Admin.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (updates.username !== undefined || updates.email !== undefined) {
    const conflictQuery = [];
    if (updates.username !== undefined && updates.username !== user.username) {
      conflictQuery.push({ username: updates.username });
    }
    if (updates.email !== undefined && updates.email !== user.email) {
      conflictQuery.push({ email: updates.email });
    }

    if (conflictQuery.length > 0) {
      const exists = await Admin.findOne({
        _id: { $ne: userId },
        $or: conflictQuery,
      });
      if (exists) {
        throw new AppError("Email or username already exists", 409);
      }
    }
  }

  if (updates.username !== undefined) user.username = updates.username;
  if (updates.email !== undefined) user.email = updates.email;

  await user.save();
  return user.toSafeObject();
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await Admin.findById(userId).select("+password +refreshToken");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400);
  }

  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.refreshToken = null;
  await user.save();

  await PasswordReset.deleteOne({ email: user.email });
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getOtpExpiresAt() {
  return new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
}

function getResendCooldownMs() {
  return OTP_RESEND_COOLDOWN_SECONDS * 1000;
}

async function findEligibleResetUser(email) {
  return Admin.findOne({
    email,
    status: "active",
    role: { $in: PASSWORD_RESET_ALLOWED_ROLES },
  });
}

function resolveSendCount(existing, now) {
  if (
    !existing?.sendCountWindowStart ||
    now.getTime() - existing.sendCountWindowStart.getTime() >= OTP_SEND_WINDOW_MS
  ) {
    return { sendCount: 0, sendCountWindowStart: now };
  }

  return {
    sendCount: existing.sendCount ?? 0,
    sendCountWindowStart: existing.sendCountWindowStart,
  };
}

function assertWithinSendCap(existing, now) {
  const { sendCount, sendCountWindowStart } = resolveSendCount(existing, now);

  if (sendCount >= MAX_OTP_SENDS_PER_24H) {
    throw new AppError("Please wait before requesting another code", 429);
  }

  return { sendCount, sendCountWindowStart };
}

async function issuePasswordResetOtp(email, context = {}) {
  const now = new Date();
  const existing = await PasswordReset.findOne({ email });
  const { sendCount, sendCountWindowStart } = assertWithinSendCap(existing, now);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const resetRecord = await PasswordReset.findOneAndUpdate(
    { email },
    {
      email,
      otpHash,
      expiresAt: getOtpExpiresAt(),
      attempts: 0,
      lastSentAt: now,
      emailStatus: "pending",
      emailSentAt: null,
      sendCount: sendCount + 1,
      sendCountWindowStart,
      $unset: { lastEmailError: 1 },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await enqueuePasswordResetEmail({
    email,
    otp,
    resetId: resetRecord._id,
  });

  await logSecurityEvent(SECURITY_EVENTS.PASSWORD_RESET_REQUESTED, {
    email,
    ip: context.ip,
    userAgent: context.userAgent,
  });
}

export async function requestPasswordResetOtp(email, context = {}) {
  const normalized = normalizeEmail(email);
  const user = await findEligibleResetUser(normalized);

  if (user) {
    await issuePasswordResetOtp(normalized, context);
  }

  return { message: GENERIC_RESET_MESSAGE };
}

export async function resendPasswordResetOtp(email, context = {}) {
  const normalized = normalizeEmail(email);
  const user = await findEligibleResetUser(normalized);

  if (!user) {
    return { message: GENERIC_RESET_MESSAGE };
  }

  const existing = await PasswordReset.findOne({ email: normalized });
  if (existing) {
    const elapsed = Date.now() - existing.lastSentAt.getTime();
    if (elapsed < getResendCooldownMs()) {
      throw new AppError("Please wait before requesting another code", 429);
    }
  }

  await issuePasswordResetOtp(normalized, context);
  return { message: GENERIC_RESET_MESSAGE };
}

export async function resetPasswordWithOtp(email, otp, newPassword, context = {}) {
  const normalized = normalizeEmail(email);
  const resetRecord = await PasswordReset.findOne({ email: normalized }).select(
    "+otpHash",
  );

  if (!resetRecord) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  if (resetRecord.expiresAt < new Date()) {
    await PasswordReset.deleteOne({ email: normalized });
    throw new AppError("Verification code expired. Request a new code.", 400);
  }

  if (resetRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await PasswordReset.deleteOne({ email: normalized });
    throw new AppError("Too many attempts. Request a new code.", 400);
  }

  const otpValid = verifyOtp(otp, resetRecord.otpHash);
  if (!otpValid) {
    resetRecord.attempts += 1;
    await resetRecord.save();

    await logSecurityEvent(SECURITY_EVENTS.PASSWORD_RESET_OTP_INVALID, {
      email: normalized,
      ip: context.ip,
      userAgent: context.userAgent,
      meta: { attempts: resetRecord.attempts },
    });

    if (resetRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await PasswordReset.deleteOne({ email: normalized });
      throw new AppError("Too many attempts. Request a new code.", 400);
    }

    throw new AppError("Invalid verification code", 400);
  }

  const user = await findEligibleResetUser(normalized);
  if (!user) {
    await PasswordReset.deleteOne({ email: normalized });
    throw new AppError("Invalid or expired verification code", 400);
  }

  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.refreshToken = null;
  await user.save();

  await PasswordReset.deleteOne({ email: normalized });

  await logSecurityEvent(SECURITY_EVENTS.PASSWORD_RESET_SUCCESS, {
    email: normalized,
    ip: context.ip,
    userAgent: context.userAgent,
    meta: { userId: user._id.toString() },
  });

  return { message: "Password updated successfully. Please sign in." };
}
