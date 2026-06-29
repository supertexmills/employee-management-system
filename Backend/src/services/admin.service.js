import Admin from "../models/admin/admin.model.js";
import { deleteAvatarFile } from "./media/avatar.service.js";
import { AppError } from "../utils/AppError.js";
import { buildTextSearchFilter, paginate } from "../utils/listQuery.js";
import {
  assertCanModifyUser,
  assertCanReadUser,
  assertCanChangeRole,
  filterUsersByRole,
} from "./rbac.service.js";
import { getManagedRoles } from "../constant/permissions.js";

export async function listAdmins(actor, query) {
  const roleFilter = filterUsersByRole(actor.role);
  if (!roleFilter) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }

  const filter = { ...roleFilter };
  if (query.role) {
    if (!getManagedRoles(actor.role).includes(query.role)) {
      throw new AppError("Forbidden: cannot list this role", 403);
    }
    filter.role = query.role;
  }
  if (query.status) {
    filter.status = query.status;
  }

  Object.assign(filter, buildTextSearchFilter(query.search, ["username", "email"]));

  const { page, limit, skip } = paginate(query);

  const [users, total] = await Promise.all([
    Admin.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Admin.countDocuments(filter),
  ]);

  return {
    data: users.map((u) => u.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getAdminById(actor, id) {
  const user = await Admin.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  assertCanReadUser(actor, user);
  return user.toSafeObject();
}

export async function updateAdmin(actor, id, updates) {
  const user = await Admin.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  assertCanModifyUser(actor, user, "update");

  if (updates.role !== undefined) {
    assertCanChangeRole(actor, user.role, updates.role);
    if (updates.role !== user.role) {
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }
    user.role = updates.role;
  }

  if (updates.username !== undefined) user.username = updates.username;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.profilePicture !== undefined) user.profilePicture = updates.profilePicture;

  if (updates.status !== undefined) {
    user.status = updates.status;
    if (updates.status !== "active") {
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      user.refreshToken = null;
    }
  }

  await user.save();
  return user.toSafeObject();
}

export async function deleteAdmin(actor, id) {
  const user = await Admin.findById(id).select("+refreshToken");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  assertCanModifyUser(actor, user, "delete");

  const previousAvatarId = user.profilePictureId;
  user.status = "inactive";
  user.refreshToken = null;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.profilePictureId = null;
  user.profilePicture = null;
  await user.save();
  await deleteAvatarFile(previousAvatarId);

  return { message: "User deactivated successfully" };
}
