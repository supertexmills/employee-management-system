import { resolveAvatarStream } from "../../services/media/avatarAccess.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const streamAvatar = asyncHandler(async (req, res, next) => {
  const { stream, contentType, length, uploadDate } = await resolveAvatarStream(
    req.user,
    req.validatedParams.userId,
  );

  res.set({
    "Content-Type": contentType,
    "Content-Length": length,
    "Cache-Control": "private, max-age=86400",
    ETag: `"${uploadDate?.getTime?.() ?? 0}"`,
  });

  stream.on("error", (err) => next(err));
  stream.pipe(res);
});
