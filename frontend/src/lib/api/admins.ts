import type { AdminListItem, UpdateAdminPayload, UserStatus } from "@/types/user";
import type { Role } from "@/lib/constants/roles";
import { apiListRequest, apiRequest } from "./client";

export type ListAdminsParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<Role, "super_admin">;
  status?: UserStatus;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adminsApi = {
  list: (params: ListAdminsParams = {}) =>
    apiListRequest<AdminListItem>(
      `/api/admins${buildQuery(params as Record<string, string | number | undefined>)}`,
    ),

  getById: (id: string) => apiRequest<AdminListItem>(`/api/admins/${id}`),

  update: (id: string, payload: UpdateAdminPayload) =>
    apiRequest<AdminListItem>(`/api/admins/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/admins/${id}`, {
      method: "DELETE",
    }),
};
