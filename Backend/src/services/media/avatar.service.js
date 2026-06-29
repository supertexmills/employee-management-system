import mongoose from "mongoose";
import sharp from "sharp";
import { AppError } from "../../utils/AppError.js";
import { buildAvatarUrl, withAvatarCacheBust } from "../../utils/avatar-url.js";

const BUCKET_NAME = "avatars";
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const AVATAR_SIZE = 256;
const WEBP_QUALITY = 80;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError("Database not connected", 503);
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

export function getMaxAvatarUploadBytes() {
  return MAX_UPLOAD_BYTES;
}

export async function processAvatarImage(buffer) {
  try {
    const processed = await sharp(buffer)
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      contentType: "image/webp",
      width: processed.info.width,
      height: processed.info.height,
      size: processed.info.size,
    };
  } catch {
    throw new AppError("Invalid image file. Use JPEG, PNG, or WebP.", 400);
  }
}

export function assertAllowedImageMime(mimeType) {
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError("Only JPEG, PNG, and WebP images are allowed", 400);
  }
}

export async function deleteAvatarFile(fileId) {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(String(fileId)));
  } catch (err) {
    if (err?.code !== "ENOENT" && err?.name !== "MongoGridFSFileNotFound") {
      console.error("Failed to delete avatar file:", err);
    }
  }
}

export async function uploadAvatarForUser(user, fileBuffer, mimeType) {
  assertAllowedImageMime(mimeType);

  const processed = await processAvatarImage(fileBuffer);
  const bucket = getBucket();
  const previousFileId = user.profilePictureId;

  const uploadStream = bucket.openUploadStream(`avatar-${user._id}.webp`, {
    contentType: processed.contentType,
    metadata: {
      kind: "avatar",
      ownerId: String(user._id),
      width: processed.width,
      height: processed.height,
      size: processed.size,
    },
  });

  await new Promise((resolve, reject) => {
    uploadStream.on("error", reject);
    uploadStream.on("finish", resolve);
    uploadStream.end(processed.buffer);
  });

  const fileId = uploadStream.id;
  user.profilePictureId = fileId;
  user.profilePicture = withAvatarCacheBust(
    buildAvatarUrl(user._id),
    Date.now(),
  );

  await user.save();
  await deleteAvatarFile(previousFileId);

  return user.toSafeObject();
}

export async function removeAvatarForUser(user) {
  const previousFileId = user.profilePictureId;
  user.profilePictureId = null;
  user.profilePicture = null;
  await user.save();
  await deleteAvatarFile(previousFileId);
  return user.toSafeObject();
}

export async function openAvatarStream(fileId) {
  if (!fileId) {
    throw new AppError("Avatar not found", 404);
  }

  const bucket = getBucket();
  const objectId = new mongoose.Types.ObjectId(String(fileId));

  const files = await bucket.find({ _id: objectId }).toArray();
  if (files.length === 0) {
    throw new AppError("Avatar not found", 404);
  }

  const file = files[0];
  return {
    stream: bucket.openDownloadStream(objectId),
    contentType: file.contentType || "image/webp",
    length: file.length,
    uploadDate: file.uploadDate,
  };
}
