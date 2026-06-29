import Admin from "../models/admin/admin.model.js";
import { verifyToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";
import { ACCESS_COOKIE } from "../utils/auth-cookies.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token =
      req.cookies?.[ACCESS_COOKIE] ??
      (header?.startsWith("Bearer ") ? header.split(" ")[1] : null);

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const decoded = verifyToken(token, "access");

    const user = await Admin.findById(decoded.sub);
    if (!user || user.status !== "active" || !user.isActive) {
      throw new AppError("Unauthorized", 401);
    }
    if (decoded.tv !== (user.tokenVersion ?? 0)) {
      throw new AppError("Token revoked", 401);
    }
    if (decoded.role !== user.role) {
      throw new AppError("Role changed, login again", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Unauthorized", 401));
  }
};
