import type {
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  SessionUser,
  UpdateProfilePayload,
  UserProfile,
} from "@/types/user";
import { apiRequest, apiUpload } from "./client";

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
      skipRefresh: true,
    }),

  refresh: () =>
    apiRequest<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      skipAuth: true,
      skipRefresh: true,
    }),

  me: () => apiRequest<UserProfile>("/api/auth/me"),

  logout: () =>
    apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<SessionUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiRequest<UserProfile>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    apiRequest<{ message: string }>("/api/auth/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
      skipRefresh: true,
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiUpload<UserProfile>("/api/auth/me/avatar", formData);
  },

  removeAvatar: () =>
    apiRequest<UserProfile>("/api/auth/me/avatar", {
      method: "DELETE",
    }),
};
