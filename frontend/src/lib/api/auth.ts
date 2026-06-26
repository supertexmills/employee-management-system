import { apiRequest, getApiBaseUrl } from "./client";
import type { ApiResponse, ProfileUser, SessionUser } from "./types";

export async function login(email: string, password: string) {
  return apiRequest<ApiResponse<{ user: SessionUser; expiresIn: number }>>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipRefresh: true,
    }
  );
}

export async function forgotPassword(email: string) {
  return apiRequest<ApiResponse<null>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipRefresh: true,
  });
}

export async function resendOtp(email: string) {
  return apiRequest<ApiResponse<null>>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipRefresh: true,
  });
}

export async function resetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiRequest<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    skipRefresh: true,
  });
}

export async function logout() {
  return apiRequest<ApiResponse<null>>("/auth/logout", { method: "POST" });
}

export async function getMe() {
  return apiRequest<ApiResponse<ProfileUser>>("/auth/me");
}

export async function updateProfile(data: { username?: string; email?: string }) {
  return apiRequest<ApiResponse<ProfileUser>>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiRequest<ApiResponse<ProfileUser>>("/auth/me/avatar", {
    method: "POST",
    body: formData,
  });
}

export async function deleteAvatar() {
  return apiRequest<ApiResponse<ProfileUser>>("/auth/me/avatar", {
    method: "DELETE",
  });
}

export async function registerAdmin(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  return apiRequest<ApiResponse<SessionUser>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function avatarUrl(userId: string) {
  return `${getApiBaseUrl()}/media/avatars/${userId}`;
}
