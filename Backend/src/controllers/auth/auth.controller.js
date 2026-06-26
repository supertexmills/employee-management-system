import * as authService from "../../services/auth.service.js";
import {
  removeAvatarForUser,
  uploadAvatarForUser,
} from "../../services/media/avatar.service.js";
import { getCapabilities } from "../../services/capabilities.service.js";
import { toSessionUserDto } from "../../dto/auth/session-user.dto.js";
import { toProfileUserDto } from "../../dto/auth/profile-user.dto.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  clearAuthCookies,
  generateCsrfToken,
  getAccessExpiresInSeconds,
  setAuthCookies,
} from "../../utils/auth-cookies.js";

function getRequestContext(req) {
  return {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  };
}

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  const csrfToken = generateCsrfToken();

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    csrfToken,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: toSessionUserDto(result.user),
      expiresIn: getAccessExpiresInSeconds(),
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const result = await authService.refresh(token);
  const csrfToken = generateCsrfToken();

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    csrfToken,
  });

  res.json({
    success: true,
    data: {
      expiresIn: getAccessExpiresInSeconds(),
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out successfully" });
});

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.user, req.body);
  res.status(201).json({
    success: true,
    data: toSessionUserDto(user),
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({
    success: true,
    data: {
      ...toProfileUserDto(user),
      capabilities: getCapabilities(user.role),
    },
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: toProfileUserDto(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  clearAuthCookies(res);
  res.json({
    success: true,
    data: { message: "Password updated. Please sign in again." },
  });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Avatar file is required", 400);
  }

  const user = await uploadAvatarForUser(req.user, req.file.buffer, req.file.mimetype);
  res.json({ success: true, data: toProfileUserDto(user) });
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await removeAvatarForUser(req.user);
  res.json({ success: true, data: toProfileUserDto(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordResetOtp(
    req.body.email,
    getRequestContext(req),
  );
  res.json({ success: true, message: result.message });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendPasswordResetOtp(
    req.body.email,
    getRequestContext(req),
  );
  res.json({ success: true, message: result.message });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPasswordWithOtp(
    req.body.email,
    req.body.otp,
    req.body.newPassword,
    getRequestContext(req),
  );
  res.json({ success: true, message: result.message });
});
