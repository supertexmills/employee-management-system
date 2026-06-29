import { apiRequest } from "./client";
import { normalizeAdmin, normalizeAdminListItem } from "./normalize";
import type { Admin, AdminListItem, ApiResponse, Pagination } from "./types";

export async function listAdmins(params?: Record<string, string | number>) {
  const res = await apiRequest<
    ApiResponse<AdminListItem[]> & { pagination: Pagination }
  >("/admins", { params });
  return {
    ...res,
    data: (res.data ?? []).map(normalizeAdminListItem),
  };
}

export async function getAdmin(id: string) {
  const res = await apiRequest<ApiResponse<Admin>>(`/admins/${id}`);
  if (res.data) {
    return { ...res, data: normalizeAdmin(res.data) };
  }
  return res;
}

export async function updateAdmin(id: string, data: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<Admin>>(`/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (res.data) {
    return { ...res, data: normalizeAdmin(res.data) };
  }
  return res;
}

export async function deleteAdmin(id: string) {
  const res = await apiRequest<ApiResponse<Admin>>(`/admins/${id}`, {
    method: "DELETE",
  });
  if (res.data) {
    return { ...res, data: normalizeAdmin(res.data) };
  }
  return res;
}
