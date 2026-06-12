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
import { PageToolbar, PageToolbarFilters } from "@/components/dashboard/toolbar/page-toolbar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { attendanceApi } from "@/lib/api/attendance";
import {
  ATTENDANCE_STATUS_LABELS,
  attendanceStatusTone,
} from "@/lib/constants/attendance";
import {
  DEPARTMENTS,
  SHIFTS,
  SHIFT_LABELS,
  type Department,
  type Shift,
} from "@/lib/constants/departments";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import { ATTENDANCE_STATUSES, type AttendanceDayRow, type AttendanceStatus } from "@/types/attendance";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AttendancePage() {
  const router = useRouter();
  const { canReadAttendance } = useAuth();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");
  const [status, setStatus] = useState<AttendanceStatus | "">("");

  useEffect(() => {
    if (!canReadAttendance()) {
      router.replace("/settings");
    }
  }, [canReadAttendance, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["attendance", "live-floor", department, shift, status],
    queryFn: () =>
      attendanceApi.liveFloor({
        page: 1,
        limit: 100,
        ...(department ? { department } : {}),
        ...(shift ? { shift } : {}),
        ...(status ? { status } : {}),
      }),
    enabled: canReadAttendance(),
    refetchInterval: 30_000,
  });

  if (!canReadAttendance()) {
    return null;
  }

  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Daily Roll"
        description="Today's attendance status for all factory employees."
        breadcrumbs={[
          { label: "Floor Monitor", href: "/overview" },
          { label: "Daily Roll" },
        ]}
      />

      <PageToolbar>
        <PageToolbarFilters>
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department | "")}
            aria-label="Filter by department"
            className="sm:min-w-[11rem] sm:max-w-xs"
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift | "")}
            aria-label="Filter by shift"
            className="sm:min-w-[9rem] sm:max-w-xs"
          >
            <option value="">All shifts</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>
                {SHIFT_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus | "")}
            aria-label="Filter by status"
            className="sm:min-w-[11rem] sm:max-w-xs"
          >
            <option value="">All statuses</option>
            {ATTENDANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ATTENDANCE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </PageToolbarFilters>
      </PageToolbar>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-border bg-white p-6 text-sm text-red-600">
          {error instanceof ApiError ? error.message : "Failed to load attendance"}
        </div>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            No attendance records for today yet
          </p>
          <p className="mt-1 text-sm text-muted">
            Employee check-ins will appear here throughout the day.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <ResponsiveTable
          data={rows}
          keyExtractor={(row) => row._id}
          renderMobileCard={(row) => <AttendanceMobileCard row={row} />}
        >
          <DataTable>
            <table className="w-full">
              <DataTableHeader>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead className="hidden md:table-cell">
                  Department
                </DataTableHead>
                <DataTableHead>Shift</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead className="hidden lg:table-cell">
                  First entry
                </DataTableHead>
                <DataTableHead className="hidden xl:table-cell">
                  Last exit
                </DataTableHead>
              </DataTableHeader>
              <DataTableBody>
                {rows.map((row) => (
                  <DataTableRow key={row._id}>
                    <DataTableCell>
                      <p className="font-medium text-slate-900">
                        {row.employee?.employeeName ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {row.department}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="hidden md:table-cell">
                      {row.department}
                    </DataTableCell>
                    <DataTableCell>{SHIFT_LABELS[row.shift]}</DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={ATTENDANCE_STATUS_LABELS[row.status]}
                        tone={attendanceStatusTone(row.status)}
                      />
                    </DataTableCell>
                    <DataTableCell className="hidden lg:table-cell">
                      {formatDateTime(row.firstEntryAt)}
                    </DataTableCell>
                    <DataTableCell className="hidden xl:table-cell">
                      {formatDateTime(row.lastExitAt)}
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

function AttendanceMobileCard({ row }: { row: AttendanceDayRow }) {
  return (
    <RecordCard>
      <RecordCardHeader
        title={row.employee?.employeeName ?? "—"}
        subtitle={row.department}
        trailing={
          <StatusBadge
            label={ATTENDANCE_STATUS_LABELS[row.status]}
            tone={attendanceStatusTone(row.status)}
          />
        }
      />
      <RecordCardRow label="Shift">{SHIFT_LABELS[row.shift]}</RecordCardRow>
      <RecordCardRow label="First entry">
        {formatDateTime(row.firstEntryAt)}
      </RecordCardRow>
      <RecordCardRow label="Last exit">
        {formatDateTime(row.lastExitAt)}
      </RecordCardRow>
    </RecordCard>
  );
}
