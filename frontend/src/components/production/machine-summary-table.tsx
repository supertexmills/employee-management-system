import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/dashboard/tables/data-table";
import { formatDateTime } from "@/lib/format";
import type { MachineShiftSummary } from "@/types/production";

type MachineSummaryTableProps = {
  summaries: MachineShiftSummary[];
};

export function MachineSummaryTable({ summaries }: MachineSummaryTableProps) {
  if (summaries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No employee rounds recorded for this machine today.
        </p>
      </div>
    );
  }

  return (
    <DataTable>
      <DataTableHeader>
        <DataTableRow>
          <DataTableHead>Employee</DataTableHead>
          <DataTableHead>Shift</DataTableHead>
          <DataTableHead className="text-right">This hour</DataTableHead>
          <DataTableHead className="text-right">Shift total</DataTableHead>
          <DataTableHead>Last round</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        {summaries.map((summary) => (
          <DataTableRow key={summary._id}>
            <DataTableCell>
              <div>
                <p className="font-medium text-slate-900">{summary.employeeName}</p>
                <p className="text-xs text-muted-foreground">{summary.employeeId}</p>
              </div>
            </DataTableCell>
            <DataTableCell className="capitalize">{summary.shift}</DataTableCell>
            <DataTableCell className="text-right tabular-nums">
              {summary.roundsThisHour}
            </DataTableCell>
            <DataTableCell className="text-right tabular-nums font-medium">
              {summary.totalRounds}
            </DataTableCell>
            <DataTableCell className="text-muted-foreground">
              {formatDateTime(summary.lastRoundAt)}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
