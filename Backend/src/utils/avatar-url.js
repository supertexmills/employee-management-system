export function buildAvatarUrl(userId) {
  if (!userId) return null;
  return `/api/media/avatars/${String(userId)}`;
}

export function withAvatarCacheBust(url, version) {
  if (!url) return null;
  if (!version) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${version}`;
}
