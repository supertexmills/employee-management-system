export function toAdminListItemDto(user) {
  return {
    id: String(user._id ?? user.id),
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}
