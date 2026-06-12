import * as authService from "../../services/auth.service.js";
import {
  removeAvatarForUser,
  uploadAvatarForUser,
} from "../../services/media/avatar.service.js";
import { toSessionUserDto } from "../../dto/auth/session-user.dto.js";
import { toProfileUserDto } from "../../dto/auth/profile-user.dto.js";
import { AppError } from "../../utils/AppError.js";
import {
  clearAuthCookies,
  generateCsrfToken,
  getAccessExpiresInSeconds,
  setAuthCookies,
} from "../../utils/auth-cookies.js";

export const login = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    clearAuthCookies(res);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.user, req.body);
    res.status(201).json({
      success: true,
      data: toSessionUserDto(user),
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    res.json({ success: true, data: toProfileUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json({ success: true, data: toProfileUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Avatar file is required", 400);
    }

    const user = await uploadAvatarForUser(
      req.user,
      req.file.buffer,
      req.file.mimetype,
    );
    res.json({ success: true, data: toProfileUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const removeAvatar = async (req, res, next) => {
  try {
    const user = await removeAvatarForUser(req.user);
    res.json({ success: true, data: toProfileUserDto(user) });
  } catch (err) {
    next(err);
  }
};
