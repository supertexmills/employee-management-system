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
import { StatusBadge } from "@/components/dashboard/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { employeesApi } from "@/lib/api/employees";
import { SHIFT_LABELS } from "@/lib/constants/departments";
import { useAuth } from "@/providers/auth-provider";
import type { Employee } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkforcePage() {
  const router = useRouter();
  const { canManageEmployee } = useAuth();
  const canRead = canManageEmployee("read");
  const canCreate = canManageEmployee("create");

  useEffect(() => {
    if (!canRead) {
      router.replace("/settings");
    }
  }, [canRead, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.list({ page: 1, limit: 50 }),
    enabled: canRead,
  });

  if (!canRead) {
    return null;
  }

  const employees = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Workforce"
        description="Factory employee records, shifts, and department assignments."
        breadcrumbs={[
          { label: "Dashboard", href: "/overview" },
          { label: "Workforce" },
        ]}
        action={
          canCreate ? (
            <Button href="/workforce/new">Add employee</Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-border bg-white p-6 text-sm text-red-600">
          {error instanceof ApiError
            ? error.message
            : "Failed to load workforce"}
        </div>
      ) : null}

      {!isLoading && !isError && employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            No employees yet
          </p>
          <p className="mt-1 text-sm text-muted">
            Add your first workforce record to get started.
          </p>
          {canCreate ? (
            <Button href="/workforce/new" className="mt-4">
              Add employee
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && employees.length > 0 ? (
        <ResponsiveTable
          data={employees}
          keyExtractor={(employee) => employee._id}
          renderMobileCard={(employee) => (
            <WorkforceMobileCard employee={employee} />
          )}
        >
          <DataTable>
            <table className="w-full">
              <DataTableHeader>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead className="hidden lg:table-cell">
                  Department
                </DataTableHead>
                <DataTableHead className="hidden xl:table-cell">
                  Designation
                </DataTableHead>
                <DataTableHead>Shift</DataTableHead>
                <DataTableHead className="hidden md:table-cell">
                  Phone
                </DataTableHead>
                <DataTableHead>Status</DataTableHead>
              </DataTableHeader>
              <DataTableBody>
                {employees.map((employee) => (
                  <DataTableRow key={employee._id}>
                    <DataTableCell>
                      <p className="font-medium text-slate-900">
                        {employee.employeeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.employeeId}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                        {employee.department}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="hidden lg:table-cell">
                      {employee.department}
                    </DataTableCell>
                    <DataTableCell className="hidden xl:table-cell">
                      {employee.designation}
                    </DataTableCell>
                    <DataTableCell>
                      {SHIFT_LABELS[employee.shift]}
                    </DataTableCell>
                    <DataTableCell className="hidden md:table-cell">
                      {employee.phoneNumber}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={employee.isActive ? "Active" : "Inactive"}
                        tone={employee.isActive ? "success" : "neutral"}
                      />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </ResponsiveTable>
      ) : null}
    </div>
  );
}

function WorkforceMobileCard({ employee }: { employee: Employee }) {
  return (
    <RecordCard>
      <RecordCardHeader
        title={employee.employeeName}
        subtitle={employee.employeeId}
        trailing={
          <StatusBadge
            label={employee.isActive ? "Active" : "Inactive"}
            tone={employee.isActive ? "success" : "neutral"}
          />
        }
      />
      <RecordCardRow label="Department">{employee.department}</RecordCardRow>
      <RecordCardRow label="Designation">{employee.designation}</RecordCardRow>
      <RecordCardRow label="Shift">{SHIFT_LABELS[employee.shift]}</RecordCardRow>
      <RecordCardRow label="Phone">{employee.phoneNumber}</RecordCardRow>
    </RecordCard>
  );
}
