/** Must match Backend JWT_ACCESS_EXPIRES_IN (default 15m). Used when /me succeeds without a fresh expiresIn. */
export const ACCESS_EXPIRES_IN_SECONDS =
  Number(process.env.NEXT_PUBLIC_ACCESS_EXPIRES_IN) || 900;

/** Refresh this long before the access cookie expires. */
export const PROACTIVE_REFRESH_BUFFER_MS = 60_000;

export function proactiveRefreshDelayMs(expiresInSeconds: number): number {
  return Math.max(0, expiresInSeconds * 1000 - PROACTIVE_REFRESH_BUFFER_MS);
}
