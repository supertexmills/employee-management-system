"use client";

import {
  canManageEmployee,
  canPerformUserAction,
  canReadAttendance,
  canReadOverview,
  canReadUsers,
  getCreatableRoles,
} from "@/lib/auth/permissions";
import { getRoleHome } from "@/lib/auth/routes";
import {
  sessionManager,
  type SessionState,
} from "@/lib/auth/session-manager";
import type { RegisterableRole, Role } from "@/lib/constants/roles";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: SessionState["user"];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getRoleHome: () => string;
  canCreateUser: () => boolean;
  canReadUsers: () => boolean;
  canReadOverview: () => boolean;
  canReadAttendance: () => boolean;
  canManageEmployee: (action: string) => boolean;
  canUserAction: (targetRole: Role, action: string) => boolean;
  creatableRoles: RegisterableRole[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState>(sessionManager.getState());

  useEffect(() => {
    sessionManager.setRedirect((path) => router.replace(path));
    return sessionManager.subscribe(setState);
  }, [router]);

  useEffect(() => {
    void sessionManager.bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = state.user?.role;

    return {
      user: state.user,
      isLoading: state.isLoading,
      isAuthenticated: Boolean(state.user),
      login: (email, password) => sessionManager.login(email, password),
      logout: () => sessionManager.logout(),
      refreshUser: () => sessionManager.refreshUser(),
      getRoleHome: () => (role ? getRoleHome(role) : "/login"),
      canCreateUser: () => (role ? getCreatableRoles(role).length > 0 : false),
      canReadUsers: () => (role ? canReadUsers(role) : false),
      canReadOverview: () => (role ? canReadOverview(role) : false),
      canReadAttendance: () => (role ? canReadAttendance(role) : false),
      canManageEmployee: (action) =>
        role ? canManageEmployee(role, action) : false,
      canUserAction: (targetRole, action) =>
        role ? canPerformUserAction(role, targetRole, action) : false,
      creatableRoles: role ? getCreatableRoles(role) : [],
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
