export function toSessionUserDto(user) {
  return {
    id: String(user._id ?? user.id),
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture ?? null,
  };
}
