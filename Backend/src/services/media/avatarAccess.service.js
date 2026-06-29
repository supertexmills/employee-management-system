import Admin from "../../models/admin/admin.model.js";
import { AppError } from "../../utils/AppError.js";
import { assertCanReadUser } from "../rbac.service.js";
import { openAvatarStream } from "./avatar.service.js";

export async function resolveAvatarStream(actor, targetUserId) {
  const target = await Admin.findById(targetUserId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  assertCanReadUser(actor, target);

  if (!target.profilePictureId) {
    throw new AppError("Avatar not found", 404);
  }

  return openAvatarStream(target.profilePictureId);
}
