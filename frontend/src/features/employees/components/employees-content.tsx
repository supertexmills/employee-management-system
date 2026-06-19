"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, FilterBar, PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmployeeFormDialog } from "@/components/forms/employee-form-dialog";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as employeesApi from "@/lib/api/employees";
import { DEPARTMENTS, SHIFTS } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { canManageEmployees } from "@/lib/rbac";
import { formatShift } from "@/lib/utils";

export function EmployeesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState("all");
  const [shift, setShift] = useState("all");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCreate = user && canManageEmployees(user.role, "create");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employees(page, search, department),
    queryFn: () =>
      employeesApi.listEmployees({
        page,
        limit: 20,
        ...(department !== "all" ? { department } : {}),
        ...(shift !== "all" ? { shift } : {}),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employee deactivated");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const employees = (data?.data ?? []).filter((e) =>
    search
      ? e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Manage factory workforce records and RFID assignments."
        actions={
          canCreate && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Employee
            </Button>
          )
        }
      />

      <FilterBar>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={(v) => v && setDepartment(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={shift} onValueChange={(v) => v && setShift(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            {SHIFTS.map((s) => (
              <SelectItem key={s} value={s}>
                {formatShift(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {isLoading ? (
          <PageSkeleton variant="table" />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Add employees or adjust your search and filters."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>RFID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/employees/${emp._id}`)}
                >
                  <TableCell className="font-medium">{emp.employeeName}</TableCell>
                  <TableCell className="font-mono text-xs">{emp.employeeId}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell className="capitalize">{emp.shift}</TableCell>
                  <TableCell className="font-mono text-xs">{emp.rfid}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/employees/${emp._id}`)}
                      >
                        View
                      </Button>
                      {user && canManageEmployees(user.role, "delete") && emp.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(emp._id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
    </div>
  );
}
