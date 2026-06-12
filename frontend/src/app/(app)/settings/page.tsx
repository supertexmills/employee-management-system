"use client";

import { AvatarUpload } from "@/components/settings/avatar-upload";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import {
  StatusBadge,
  userStatusTone,
} from "@/components/dashboard/tables/status-badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { formatLastLogin, formatUserStatus } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "session", label: "Session" },
] as const;

type SettingsTab = (typeof TABS)[number]["id"];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Account Settings"
        description="Manage your profile, credentials, and active session."
        breadcrumbs={[
          { label: "Dashboard", href: "/overview" },
          { label: "Settings" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] lg:flex-col lg:overflow-visible lg:pb-0"
          aria-label="Settings sections"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors lg:shrink",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-surface-alt hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeTab === "profile" ? (
            <>
              <section className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
                <div className="mb-6 border-b border-border pb-6">
                  <h2 className="text-base font-semibold text-slate-900">
                    Profile photo
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Visible across the portal for your team.
                  </p>
                </div>
                <AvatarUpload
                  username={user.username}
                  profilePicture={user.profilePicture}
                />
              </section>

              <section className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
                <div className="mb-6 border-b border-border pb-6">
                  <h2 className="text-base font-semibold text-slate-900">
                    Personal details
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Update how your name and email appear in FactoryFlow.
                  </p>
                </div>
                <ProfileForm user={user} />
              </section>

              <section className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Account metadata
                  </h2>
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Role
                    </dt>
                    <dd className="mt-2">
                      <StatusBadge label={ROLE_LABELS[user.role]} tone="info" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </dt>
                    <dd className="mt-2">
                      <StatusBadge
                        label={formatUserStatus(user.status)}
                        tone={userStatusTone(user.status)}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Last login
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatLastLogin(user.lastLoginAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Account created
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </dl>
              </section>
            </>
          ) : null}

          {activeTab === "security" ? (
            <section className="rounded-xl border border-border bg-white p-6 shadow-sm shadow-slate-900/5">
              <div className="mb-6 border-b border-border pb-6">
                <h2 className="text-base font-semibold text-slate-900">
                  Password
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your current password to set a new one.
                </p>
              </div>
              <PasswordForm />
            </section>
          ) : null}

          {activeTab === "session" ? (
            <section className="rounded-xl border border-border bg-white p-6 shadow-sm shadow-slate-900/5">
              <div className="mb-6 border-b border-border pb-6">
                <h2 className="text-base font-semibold text-slate-900">
                  Active session
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign out when you are finished on a shared workstation.
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Signed in as
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {user.username}
                  </dd>
                  <dd className="text-sm text-muted-foreground">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last activity
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatLastLogin(user.lastLoginAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-border pt-6">
                <Button variant="outline" onClick={() => logout()}>
                  Sign out
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
