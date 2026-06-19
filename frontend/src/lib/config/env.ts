/** Browser-facing API base (same-origin proxy in dev/prod). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** Server-side rewrite target for Next.js (not exposed to the browser). */
export const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://127.0.0.1:8080";
