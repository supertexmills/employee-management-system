import multer from "multer";
import { AppError } from "../utils/AppError.js";
import { getMaxAvatarUploadBytes } from "../services/media/avatar.service.js";

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: getMaxAvatarUploadBytes(), files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new AppError("Only JPEG, PNG, and WebP images are allowed", 400));
      return;
    }
    cb(null, true);
  },
});

export const uploadAvatarMiddleware = avatarUpload.single("avatar");

export function handleUploadError(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("Image must be 2MB or smaller", 400));
    }
    return next(new AppError(err.message, 400));
  }
  return next(err);
}
