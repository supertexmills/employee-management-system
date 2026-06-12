import { authApi } from "@/lib/api/auth";
import { AuthError, coordinatedTokenRefresh, registerAuthHandlers } from "@/lib/api/client";
import {
  ACCESS_EXPIRES_IN_SECONDS,
  proactiveRefreshDelayMs,
} from "@/lib/auth/session-config";
import type { UserProfile } from "@/types/user";

type SessionListener = (state: SessionState) => void;

export type SessionState = {
  user: UserProfile | null;
  isLoading: boolean;
};

class SessionManager {
  private user: UserProfile | null = null;
  private isLoading = true;
  private listeners = new Set<SessionListener>();
  private bootstrapPromise: Promise<void> | null = null;
  private handlingAuthFailure = false;
  private proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private silentRefreshPromise: Promise<void> | null = null;
  private redirectFn: ((path: string) => void) | null = null;

  constructor() {
    registerAuthHandlers({
      onAuthFailure: () => this.onAuthFailure(),
      onSessionRefreshed: (expiresIn) => this.scheduleProactiveRefresh(expiresIn),
    });
  }

  setRedirect(fn: (path: string) => void) {
    this.redirectFn = fn;
  }

  subscribe(listener: SessionListener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): SessionState {
    return { user: this.user, isLoading: this.isLoading };
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return Boolean(this.user);
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private redirect(path: string) {
    if (this.redirectFn) {
      this.redirectFn(path);
    } else if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  }

  private clearProactiveRefresh() {
    if (this.proactiveRefreshTimer) {
      clearTimeout(this.proactiveRefreshTimer);
      this.proactiveRefreshTimer = null;
    }
  }

  /**
   * Schedule a refresh before the access token expires.
   * @param expiresIn Seconds until the current access token expires (duration, not a timestamp).
   */
  scheduleProactiveRefresh(expiresIn: number) {
    this.clearProactiveRefresh();

    const delay = proactiveRefreshDelayMs(expiresIn);
    if (delay === 0) {
      void this.silentRefresh();
      return;
    }

    this.proactiveRefreshTimer = setTimeout(() => {
      void this.silentRefresh();
    }, delay);
  }

  private silentRefresh() {
    this.silentRefreshPromise ??= this.runSilentRefresh().finally(() => {
      this.silentRefreshPromise = null;
    });
    return this.silentRefreshPromise;
  }

  private async runSilentRefresh() {
    try {
      // coordinatedTokenRefresh is single-flight; onSessionRefreshed reschedules the timer.
      await coordinatedTokenRefresh();
    } catch {
      this.onAuthFailure();
    }
  }

  async bootstrap() {
    this.bootstrapPromise ??= this.runBootstrap().finally(() => {
      this.bootstrapPromise = null;
    });
    return this.bootstrapPromise;
  }

  private async runBootstrap() {
    this.isLoading = true;
    this.notify();

    try {
      try {
        this.user = await authApi.me();
        // Access cookie is valid; schedule using known TTL (no expiresIn on /me).
        this.scheduleProactiveRefresh(ACCESS_EXPIRES_IN_SECONDS);
      } catch (err) {
        if (!(err instanceof AuthError)) {
          throw err;
        }
        await coordinatedTokenRefresh();
        this.user = await authApi.me();
      }
    } catch {
      this.user = null;
      this.clearProactiveRefresh();
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  async login(email: string, password: string) {
    const { expiresIn } = await authApi.login(email, password);
    this.handlingAuthFailure = false;
    this.scheduleProactiveRefresh(expiresIn);
    this.user = await authApi.me();
    this.notify();
    // Navigation is handled by LoginRedirect (supports ?from= deep links).
  }

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // Clear local session even if API logout fails
    } finally {
      this.user = null;
      this.clearProactiveRefresh();
      this.handlingAuthFailure = false;
      this.notify();
      this.redirect("/login");
    }
  }

  async refreshUser() {
    this.user = await authApi.me();
    this.notify();
  }

  onAuthFailure() {
    if (this.handlingAuthFailure) return;
    this.handlingAuthFailure = true;

    this.user = null;
    this.clearProactiveRefresh();
    this.isLoading = false;
    this.notify();
    this.redirect("/login");
  }
}

export const sessionManager = new SessionManager();
