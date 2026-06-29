import * as adminService from "../../services/admin.service.js";
import { toAdminListItemDto } from "../../dto/admin/admin-list-item.dto.js";
import { toProfileUserDto } from "../../dto/auth/profile-user.dto.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const result = await adminService.listAdmins(req.user, req.validatedQuery);
  res.json({
    success: true,
    data: result.data.map((user) => toAdminListItemDto(user)),
    pagination: result.pagination,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const user = await adminService.getAdminById(req.user, req.validatedParams.id);
  res.json({ success: true, data: toProfileUserDto(user) });
});

export const update = asyncHandler(async (req, res) => {
  const user = await adminService.updateAdmin(req.user, req.validatedParams.id, req.body);
  res.json({ success: true, data: toAdminListItemDto(user) });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await adminService.deleteAdmin(req.user, req.validatedParams.id);
  res.json({ success: true, ...result });
});
