import crypto from "crypto";
import { env } from "../config/env.js";

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const CSRF_COOKIE = "csrfToken";

const LEGACY_PATHS = ["/", "/api/auth", "/api/auth/refresh"];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function cookieBaseOptions() {
  return {
    secure: env.isProduction,
    sameSite: env.isProduction ? "strict" : "lax",
  };
}

function parseDurationToSeconds(value) {
  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 900;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
}

export function getAccessExpiresInSeconds() {
  return parseDurationToSeconds(env.jwtAccessExpiresIn);
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function clearCookie(res, name) {
  for (const path of LEGACY_PATHS) {
    res.clearCookie(name, { path });
  }
}

export function clearAuthCookies(res) {
  clearCookie(res, ACCESS_COOKIE);
  clearCookie(res, REFRESH_COOKIE);
  clearCookie(res, CSRF_COOKIE);
}

export function setAuthCookies(res, { accessToken, refreshToken, csrfToken }) {
  clearAuthCookies(res);

  const base = cookieBaseOptions();
  const accessMaxAge = getAccessExpiresInSeconds() * 1000;

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    httpOnly: true,
    maxAge: accessMaxAge,
    path: "/",
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    httpOnly: true,
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });

  res.cookie(CSRF_COOKIE, csrfToken, {
    ...base,
    httpOnly: false,
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
}
