import type { Admin, AdminListItem } from "./types";

type RawAdminListItem = {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: Admin["role"];
  status: Admin["status"];
  lastLoginAt?: string | null;
  profilePicture?: string | null;
};

export function normalizeAdminListItem(raw: RawAdminListItem): AdminListItem {
  const id = String(raw.id ?? raw._id ?? "");
  return {
    id,
    _id: id,
    username: raw.username,
    email: raw.email,
    role: raw.role,
    status: raw.status,
    isActive: raw.status === "active",
    lastLoginAt: raw.lastLoginAt ?? null,
    profilePicture: raw.profilePicture ?? null,
  };
}

export function normalizeAdmin(raw: RawAdminListItem): Admin {
  return normalizeAdminListItem(raw);
}
