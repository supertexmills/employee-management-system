import Admin from "../../models/admin/admin.model.js";
import { openAvatarStream } from "../../services/media/avatar.service.js";
import { AppError } from "../../utils/AppError.js";

export const streamAvatar = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.validatedParams.userId);
    if (!user?.profilePictureId) {
      throw new AppError("Avatar not found", 404);
    }

    const { stream, contentType, length, uploadDate } = await openAvatarStream(
      user.profilePictureId,
    );

    res.set({
      "Content-Type": contentType,
      "Content-Length": length,
      "Cache-Control": "private, max-age=86400",
      ETag: `"${user.profilePictureId}-${uploadDate?.getTime?.() ?? 0}"`,
    });

    stream.on("error", (err) => next(err));
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
