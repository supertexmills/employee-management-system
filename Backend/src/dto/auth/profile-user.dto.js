import { toSessionUserDto } from "./session-user.dto.js";

export function toProfileUserDto(user) {
  return {
    ...toSessionUserDto(user),
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  };
}
