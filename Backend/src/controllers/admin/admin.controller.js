import * as adminService from "../../services/admin.service.js";
import { toAdminListItemDto } from "../../dto/admin/admin-list-item.dto.js";
import { toProfileUserDto } from "../../dto/auth/profile-user.dto.js";

export const list = async (req, res, next) => {
  try {
    const result = await adminService.listAdmins(req.user, req.validatedQuery);
    res.json({
      success: true,
      data: result.data.map((user) => toAdminListItemDto(user)),
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const user = await adminService.getAdminById(req.user, req.validatedParams.id);
    res.json({ success: true, data: toProfileUserDto(user) });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await adminService.updateAdmin(
      req.user,
      req.validatedParams.id,
      req.body,
    );
    res.json({ success: true, data: toAdminListItemDto(user) });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdmin(req.user, req.validatedParams.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
