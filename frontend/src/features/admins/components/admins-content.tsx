"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as adminsApi from "@/lib/api/admins";
import * as authApi from "@/lib/api/auth";
import type { AdminListItem } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export function AdminsContent() {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const search = useDebounce(inputValue, 300);

  useEffect(() => {
    setPage(1);
  }, [search]);
  const [open, setOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "manager",
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admins(page, search),
    queryFn: () =>
      adminsApi.listAdmins({
        page,
        limit: 20,
        ...(search ? { search } : {}),
      }),
  });

  const registerMutation = useMutation({
    mutationFn: () => authApi.registerAdmin(form),
    onSuccess: () => {
      toast.success("Admin created");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminsApi.deleteAdmin(id),
    onSuccess: () => {
      toast.success("Admin deactivated");
      setDeactivateId(null);
      void queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const admins = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        subtitle="Manage admin users and role assignments."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Admin
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search admins..."
          className="pl-10"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <DataTable<AdminListItem>
            columns={[
              {
                key: "username",
                header: "Username",
                cell: (admin) => (
                  <span className="font-medium">{admin.username}</span>
                ),
              },
              { key: "email", header: "Email", cell: (admin) => admin.email },
              {
                key: "role",
                header: "Role",
                cell: (admin) => (
                  <span className="capitalize">{admin.role.replace("_", " ")}</span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (admin) => <StatusBadge status={admin.status} />,
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                cell: (admin) =>
                  admin.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeactivateId(admin.id)}
                    >
                      Deactivate
                    </Button>
                  ) : null,
              },
            ]}
            data={admins}
            rowKey={(admin) => admin.id}
            isLoading={isLoading}
            emptyTitle="No admins found"
            emptyDescription="Create an admin user to get started."
            pagination={data?.pagination}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => v && setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending}
            >
              Create Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateId}
        onOpenChange={(open) => !open && setDeactivateId(null)}
        title="Deactivate admin?"
        description="This admin will no longer be able to sign in."
        confirmLabel="Deactivate"
        loading={deleteMutation.isPending}
        onConfirm={() => deactivateId && deleteMutation.mutate(deactivateId)}
      />
    </div>
  );
}
