"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { FilterBar, PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { EmployeeFormDialog } from "@/components/forms/employee-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [inputValue, setInputValue] = useState(searchParams.get("search") ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);

  const search = useDebounce(inputValue, 300);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const canCreate = canManageEmployees(user, "create");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employees(page, search, department, shift),
    queryFn: () =>
      employeesApi.listEmployees({
        page,
        limit: 20,
        ...(department !== "all" ? { department } : {}),
        ...(shift !== "all" ? { shift } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
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

  const employees = data?.data ?? [];

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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
        <DataTable
          caption="Employees list"
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (emp) => <span className="font-medium">{emp.employeeName}</span>,
            },
            {
              key: "employeeId",
              header: "Employee ID",
              className: "font-mono text-xs",
              cell: (emp) => emp.employeeId,
            },
            {
              key: "department",
              header: "Department",
              cell: (emp) => emp.department,
            },
            {
              key: "shift",
              header: "Shift",
              className: "capitalize",
              cell: (emp) => emp.shift,
            },
            {
              key: "rfid",
              header: "RFID",
              className: "font-mono text-xs",
              cell: (emp) => emp.rfid,
            },
            {
              key: "status",
              header: "Status",
              cell: (emp) => (
                <StatusBadge status={emp.isActive ? "active" : "inactive"} />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              headerClassName: "text-right",
              className: "text-right",
              cell: (emp) => (
                <div
                  className="flex justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canManageEmployees(user, "delete") && emp.isActive && (
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
              ),
            },
          ]}
          data={employees}
          rowKey={(emp) => emp._id}
          isLoading={isLoading}
          emptyTitle="No employees found"
          emptyDescription="Add employees or adjust your search and filters."
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(emp) => router.push(`/employees/${emp._id}`)}
        />
      </div>

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
