"use client";

import { PageHeader } from "@/components/dashboard/shell/page-header";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/dashboard/tables/data-table";
import {
  RecordCard,
  RecordCardHeader,
  RecordCardRow,
} from "@/components/dashboard/tables/record-card";
import { ResponsiveTable } from "@/components/dashboard/tables/responsive-table";
import {
  StatusBadge,
  userStatusTone,
} from "@/components/dashboard/tables/status-badge";
import {
  PageToolbar,
  PageToolbarFilters,
} from "@/components/dashboard/toolbar/page-toolbar";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminsApi } from "@/lib/api/admins";
import { ApiError } from "@/lib/api/client";
import { REGISTERABLE_ROLES, ROLE_LABELS } from "@/lib/constants/roles";
import { formatLastLogin, formatUserStatus } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import type { AdminListItem, UserStatus } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canReadUsers, canCreateUser, canUserAction, user: currentUser } =
    useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDeactivate, setPendingDeactivate] =
    useState<AdminListItem | null>(null);
  const [pendingReactivate, setPendingReactivate] =
    useState<AdminListItem | null>(null);

  useEffect(() => {
    if (!canReadUsers()) {
      router.replace("/settings");
    }
  }, [canReadUsers, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [
      "admins",
      page,
      debouncedSearch,
      roleFilter,
      statusFilter,
    ],
    queryFn: () =>
      adminsApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        role: roleFilter
          ? (roleFilter as (typeof REGISTERABLE_ROLES)[number])
          : undefined,
        status: statusFilter ? (statusFilter as UserStatus) : undefined,
      }),
    enabled: canReadUsers(),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminsApi.update(id, { status: "inactive" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      setPendingDeactivate(null);
      toast.success("User deactivated");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Action failed");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => adminsApi.update(id, { status: "active" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      setPendingReactivate(null);
      toast.success("User reactivated");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Action failed");
    },
  });

  const isActionPending =
    deactivateMutation.isPending || reactivateMutation.isPending;

  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.pages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const hasFilters = Boolean(debouncedSearch || roleFilter || statusFilter);
  const users = data?.data ?? [];

  if (!canReadUsers()) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Portal Users"
        description="Manage admin, manager, HR, and employee login accounts. Control access, roles, and account status across your organization."
        breadcrumbs={[
          { label: "Dashboard", href: "/overview" },
          { label: "Portal Users" },
        ]}
        action={
          canCreateUser() ? (
            <Button href="/users/new">Create user</Button>
          ) : undefined
        }
      />

      <PageToolbar
        meta={
          total > 0
            ? `Showing ${rangeStart}–${rangeEnd} of ${total} users`
            : isFetching
              ? "Loading users..."
              : "No users to display"
        }
      >
        <PageToolbarFilters>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="min-[480px]:col-span-2 sm:min-w-[16rem] sm:max-w-xs"
            aria-label="Search users"
          />
          <Select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
            className="sm:min-w-[11rem] sm:max-w-xs"
          >
            <option value="">All roles</option>
            {REGISTERABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="sm:min-w-[11rem] sm:max-w-xs"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>
        </PageToolbarFilters>
      </PageToolbar>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-border bg-white p-6 text-sm text-red-600">
          {error instanceof ApiError ? error.message : "Failed to load users"}
        </div>
      ) : null}

      {!isLoading && !isError && users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            {hasFilters ? "No users match your filters" : "No users found"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters
              ? "Try adjusting search or clearing filters."
              : "Create the first portal account for your organization."}
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          ) : canCreateUser() ? (
            <Button href="/users/new" className="mt-4">
              Create user
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && users.length > 0 ? (
        <>
          <ResponsiveTable
            data={users}
            keyExtractor={(user) => user.id}
            renderMobileCard={(user) => {
              const canManageUser =
                user.id !== currentUser?.id &&
                canUserAction(user.role, "update");
              const canDeactivate =
                canManageUser && user.status === "active";
              const canReactivate =
                canManageUser &&
                (user.status === "inactive" || user.status === "suspended");

              return (
                <RecordCard>
                  <RecordCardHeader
                    title={user.username}
                    subtitle={user.email}
                    trailing={
                      <StatusBadge
                        label={formatUserStatus(user.status)}
                        tone={userStatusTone(user.status)}
                      />
                    }
                  />
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar name={user.username} />
                    <StatusBadge
                      label={ROLE_LABELS[user.role]}
                      tone="info"
                    />
                  </div>
                  <RecordCardRow label="Last login">
                    {formatLastLogin(user.lastLoginAt)}
                  </RecordCardRow>
                  {(canDeactivate || canReactivate) && (
                    <div className="mt-3 border-t border-border/60 pt-3">
                      {canDeactivate ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isActionPending}
                          onClick={() => setPendingDeactivate(user)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isActionPending}
                          onClick={() => setPendingReactivate(user)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  )}
                </RecordCard>
              );
            }}
          >
            <DataTable>
              <table className="w-full">
                <DataTableHeader>
                  <DataTableHead>User</DataTableHead>
                  <DataTableHead className="hidden sm:table-cell">
                    Role
                  </DataTableHead>
                  <DataTableHead>Status</DataTableHead>
                  <DataTableHead className="hidden lg:table-cell">
                    Last login
                  </DataTableHead>
                  <DataTableHead className="text-right">Actions</DataTableHead>
                </DataTableHeader>
                <DataTableBody>
                  {users.map((user) => {
                    const canManageUser =
                      user.id !== currentUser?.id &&
                      canUserAction(user.role, "update");
                    const canDeactivate =
                      canManageUser && user.status === "active";
                    const canReactivate =
                      canManageUser &&
                      (user.status === "inactive" ||
                        user.status === "suspended");

                    return (
                      <DataTableRow key={user.id}>
                        <DataTableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={user.username} />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900">
                                {user.username}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              <p className="mt-0.5 sm:hidden">
                                <StatusBadge
                                  label={ROLE_LABELS[user.role]}
                                  tone="info"
                                />
                              </p>
                            </div>
                          </div>
                        </DataTableCell>
                        <DataTableCell className="hidden sm:table-cell">
                          <StatusBadge
                            label={ROLE_LABELS[user.role]}
                            tone="info"
                          />
                        </DataTableCell>
                        <DataTableCell>
                          <StatusBadge
                            label={formatUserStatus(user.status)}
                            tone={userStatusTone(user.status)}
                          />
                        </DataTableCell>
                        <DataTableCell className="hidden lg:table-cell">
                          <span
                            title={
                              user.lastLoginAt
                                ? undefined
                                : "User has not signed in yet"
                            }
                          >
                            {formatLastLogin(user.lastLoginAt)}
                          </span>
                        </DataTableCell>
                        <DataTableCell className="text-right">
                          {canDeactivate ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActionPending}
                              onClick={() => setPendingDeactivate(user)}
                            >
                              Deactivate
                            </Button>
                          ) : canReactivate ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActionPending}
                              onClick={() => setPendingReactivate(user)}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </table>
            </DataTable>
          </ResponsiveTable>

          {totalPages > 1 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={page >= totalPages || isFetching}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDeactivate)}
        title={
          pendingDeactivate
            ? `Deactivate ${pendingDeactivate.username}?`
            : "Deactivate user?"
        }
        description="This user will be signed out immediately and cannot access the portal until reactivated."
        confirmLabel="Deactivate user"
        variant="danger"
        isLoading={deactivateMutation.isPending}
        onCancel={() => setPendingDeactivate(null)}
        onConfirm={() => {
          if (pendingDeactivate) {
            deactivateMutation.mutate(pendingDeactivate.id);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingReactivate)}
        title={
          pendingReactivate
            ? `Reactivate ${pendingReactivate.username}?`
            : "Reactivate user?"
        }
        description="This user will regain portal access and can sign in with their existing credentials."
        confirmLabel="Reactivate user"
        isLoading={reactivateMutation.isPending}
        onCancel={() => setPendingReactivate(null)}
        onConfirm={() => {
          if (pendingReactivate) {
            reactivateMutation.mutate(pendingReactivate.id);
          }
        }}
      />
    </div>
  );
}
