import type { Role } from "@/lib/constants/roles";

export type UserStatus = "pending" | "active" | "inactive" | "suspended";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: Role;
  profilePicture: string | null;
};

export type UserProfile = SessionUser & {
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AdminListItem = {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
};

export type LoginResponse = {
  user: SessionUser;
  expiresIn: number;
};

export type RefreshResponse = {
  expiresIn: number;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  role: Exclude<Role, "super_admin">;
};

export type UpdateAdminPayload = {
  username?: string;
  email?: string;
  role?: Exclude<Role, "super_admin">;
  status?: UserStatus;
  profilePicture?: string | null;
};

export type UpdateProfilePayload = {
  username?: string;
  email?: string;
};
