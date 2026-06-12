import { getCsrfToken } from "@/lib/auth/csrf";
import type { ApiErrorBody, ApiListSuccess, ApiSuccess } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise: Promise<number | null> | null = null;
let onAuthFailureHandler: (() => void) | null = null;
let onSessionRefreshedHandler: ((expiresIn: number) => void) | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class AuthError extends ApiError {
  constructor(message = "Session expired") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export function registerAuthHandlers(handlers: {
  onAuthFailure?: () => void;
  onSessionRefreshed?: (expiresIn: number) => void;
}) {
  if (handlers.onAuthFailure) {
    onAuthFailureHandler = handlers.onAuthFailure;
  }
  if (handlers.onSessionRefreshed) {
    onSessionRefreshedHandler = handlers.onSessionRefreshed;
  }
}

function buildUrl(path: string) {
  return `${API_URL}${path}`;
}

function triggerAuthFailure() {
  onAuthFailureHandler?.();
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function applyCsrfHeader(headers: Headers, method: string) {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return;

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
}

async function refreshSession(): Promise<number | null> {
  const res = await fetch(buildUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const body = await parseJson<ApiSuccess<{ expiresIn: number }>>(res);
  onSessionRefreshedHandler?.(body.data.expiresIn);
  return body.data.expiresIn;
}

/**
 * Single-flight token refresh shared by the API client (401 retry) and session manager
 * (proactive refresh). Prevents concurrent refresh calls that can trigger token reuse revocation.
 */
export async function coordinatedTokenRefresh(): Promise<number> {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });

  const expiresIn = await refreshPromise;
  if (!expiresIn) {
    throw new AuthError();
  }

  return expiresIn;
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  responseType?: "data" | "list";
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    skipAuth = false,
    skipRefresh = false,
    responseType = "data",
    ...init
  } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  applyCsrfHeader(headers, method);

  let res = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  if (
    res.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    path !== "/api/auth/login"
  ) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const expiresIn = await refreshPromise;

    if (!expiresIn) {
      triggerAuthFailure();
      throw new AuthError();
    }

    const retryHeaders = new Headers(init.headers);
    if (init.body && !retryHeaders.has("Content-Type")) {
      retryHeaders.set("Content-Type", "application/json");
    }
    applyCsrfHeader(retryHeaders, method);

    res = await fetch(buildUrl(path), {
      ...init,
      headers: retryHeaders,
      credentials: "include",
    });
  }

  if (responseType === "list") {
    const body = await parseJson<ApiListSuccess<unknown> | ApiErrorBody>(res);

    if (!res.ok) {
      const message =
        "message" in body && body.message ? body.message : "Request failed";
      if (res.status === 401 && path !== "/api/auth/refresh") {
        triggerAuthFailure();
      }
      if (res.status === 401) {
        throw new AuthError(message);
      }
      throw new ApiError(message, res.status);
    }

    return body as T;
  }

  const body = await parseJson<ApiSuccess<unknown> | ApiErrorBody>(res);

  if (!res.ok) {
    const message =
      "message" in body && body.message ? body.message : "Request failed";
    if (res.status === 401 && path !== "/api/auth/refresh") {
      triggerAuthFailure();
    }
    if (res.status === 401) {
      throw new AuthError(message);
    }
    throw new ApiError(message, res.status);
  }

  return (body as ApiSuccess<unknown>).data as T;
}

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestOptions, "responseType"> = {},
): Promise<T> {
  return request<T>(path, { ...options, responseType: "data" });
}

export async function apiListRequest<T>(
  path: string,
  options: Omit<RequestOptions, "responseType"> = {},
): Promise<ApiListSuccess<T>> {
  return request<ApiListSuccess<T>>(path, { ...options, responseType: "list" });
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  const headers = new Headers();
  applyCsrfHeader(headers, method);

  let res = await fetch(buildUrl(path), {
    method,
    headers,
    body: formData,
    credentials: "include",
  });

  if (res.status === 401) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const expiresIn = await refreshPromise;

    if (!expiresIn) {
      triggerAuthFailure();
      throw new AuthError();
    }

    const retryHeaders = new Headers();
    applyCsrfHeader(retryHeaders, method);

    res = await fetch(buildUrl(path), {
      method,
      headers: retryHeaders,
      body: formData,
      credentials: "include",
    });
  }

  const body = await parseJson<ApiSuccess<unknown> | ApiErrorBody>(res);

  if (!res.ok) {
    const message =
      "message" in body && body.message ? body.message : "Upload failed";
    if (res.status === 401) {
      triggerAuthFailure();
      throw new AuthError(message);
    }
    throw new ApiError(message, res.status);
  }

  return (body as ApiSuccess<unknown>).data as T;
}
