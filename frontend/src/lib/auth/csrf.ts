const CSRF_COOKIE = "csrfToken";

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}
