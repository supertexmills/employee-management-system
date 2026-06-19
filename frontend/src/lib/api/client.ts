import { API_BASE_URL } from "@/lib/config/env";
import { getCookie } from "@/lib/utils";

const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipRefresh?: boolean;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

  const url = base.startsWith("http")
    ? new URL(`${base}${normalizedPath}`)
    : new URL(`${base}${normalizedPath}`, origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

let refreshPromise: Promise<void> | null = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError("Session expired", 401);
      })
      .catch((err) => {
        if (err instanceof ApiError) throw err;
        throw new ApiError("Cannot reach server. Is the backend running?", 0);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipRefresh, headers, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const isMutation = !["GET", "HEAD"].includes(method);

  const requestHeaders = new Headers(headers);
  if (isMutation) {
    const csrf = getCookie("csrfToken");
    if (csrf) requestHeaders.set("X-CSRF-Token", csrf);
  }
  if (init.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const execute = async () => {
    try {
      return await fetch(buildUrl(path, params), {
        ...init,
        method,
        credentials: "include",
        headers: requestHeaders,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new ApiError("Request timed out", 0);
      }
      throw new ApiError("Cannot reach server. Is the backend running?", 0);
    }
  };

  let response = await execute();

  if (response.status === 401 && !skipRefresh && !path.includes("/auth/login")) {
    try {
      await refreshSession();
      response = await execute();
    } catch {
      throw new ApiError("Unauthorized", 401);
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.message ?? "Request failed", response.status);
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
