import Admin from "../models/admin/admin.model.js";
import { AppError } from "../utils/AppError.js";
import { issueTokenPair, verifyToken } from "../utils/token.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { assertCanCreateUser } from "./rbac.service.js";

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
    throw new AppError("Invalid refresh token", 401);
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
