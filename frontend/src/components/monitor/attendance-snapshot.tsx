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
import {
  ATTENDANCE_STATUS_LABELS,
  attendanceStatusTone,
} from "@/lib/constants/attendance";
import { SHIFT_LABELS } from "@/lib/constants/departments";
import { formatDateTime } from "@/lib/format";
import type { AttendanceDayRow } from "@/types/attendance";

type AttendanceSnapshotProps = {
  rows: AttendanceDayRow[];
  isLoading?: boolean;
};

export function AttendanceSnapshot({ rows, isLoading }: AttendanceSnapshotProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Today&apos;s attendance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily roll snapshot across the factory floor.
          </p>
        </div>
        <Button href="/attendance" variant="outline" size="sm" className="w-full sm:w-auto">
          View all
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            No attendance records yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee check-ins will appear here throughout the day.
          </p>
        </div>
      ) : (
        <ResponsiveTable
          data={rows}
          keyExtractor={(row) => row._id}
          renderMobileCard={(row) => (
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
              <RecordCardRow label="First in">
                {formatDateTime(row.firstEntryAt)}
              </RecordCardRow>
            </RecordCard>
          )}
        >
          <DataTable>
            <table className="w-full">
              <DataTableHeader>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead className="hidden md:table-cell">
                  Department
                </DataTableHead>
                <DataTableHead className="hidden sm:table-cell">Shift</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead className="hidden lg:table-cell">First in</DataTableHead>
              </DataTableHeader>
              <DataTableBody>
                {rows.map((row) => (
                  <DataTableRow key={row._id}>
                    <DataTableCell>
                      <p className="font-medium text-slate-900">
                        {row.employee?.employeeName ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {row.department} · {SHIFT_LABELS[row.shift]}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="hidden md:table-cell">
                      {row.department}
                    </DataTableCell>
                    <DataTableCell className="hidden sm:table-cell">
                      {SHIFT_LABELS[row.shift]}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={ATTENDANCE_STATUS_LABELS[row.status]}
                        tone={attendanceStatusTone(row.status)}
                      />
                    </DataTableCell>
                    <DataTableCell className="hidden lg:table-cell tabular-nums">
                      {formatDateTime(row.firstEntryAt)}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </ResponsiveTable>
      )}
    </div>
  );
}
