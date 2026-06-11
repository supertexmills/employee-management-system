import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const issuer = "supertex-api";

export function issueTokenPair(user) {
  const base = {
    sub: String(user._id),
    role: user.role,
    tv: user.tokenVersion ?? 0,
  };

  const accessToken = jwt.sign(
    { ...base, type: "access" },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn, issuer }
  );

  const refreshToken = jwt.sign(
    { sub: base.sub, tv: base.tv, type: "refresh" },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn, issuer }
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token, type) {
  const secret = type === "access" ? env.jwtAccessSecret : env.jwtRefreshSecret;
  const payload = jwt.verify(token, secret, { issuer });
  if (payload.type !== type) {
    throw new Error("Invalid token type");
  }
  return payload;
}
