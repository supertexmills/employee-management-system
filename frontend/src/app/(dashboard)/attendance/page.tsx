"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import {
  EmptyState,
  FilterBar,
  LiveIndicator,
  PageHeader,
} from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as attendanceApi from "@/lib/api/attendance";
import { ATTENDANCE_STATUSES, DEPARTMENTS, SHIFTS } from "@/lib/constants";
import type { AttendanceSummary } from "@/lib/api/types";
import { useRfidStream } from "@/hooks/use-sse";
import { formatMinutes, formatShift } from "@/lib/utils";
import type { Employee } from "@/lib/api/types";

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState("all");
  const [shift, setShift] = useState("all");
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const filters = {
    ...(department !== "all" ? { department } : {}),
    ...(shift !== "all" ? { shift } : {}),
  };

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["attendance-summary", filters],
    queryFn: () => attendanceApi.getTodaySummary(filters),
    refetchInterval: 15_000,
  });

  const { data: floor, isLoading: floorLoading } = useQuery({
    queryKey: ["attendance-live", page, department, shift, status],
    queryFn: () =>
      attendanceApi.getLiveFloor({
        page,
        limit: 50,
        ...(department !== "all" ? { department } : {}),
        ...(shift !== "all" ? { shift } : {}),
        ...(status !== "all" ? { status } : {}),
      }),
    refetchInterval: 15_000,
  });

  const onSse = useCallback(
    (event: string, data: unknown) => {
      if (event === "attendance:summary") {
        queryClient.setQueryData(["attendance-summary", filters], {
          success: true,
          data: data as AttendanceSummary,
        });
      }
      if (event === "attendance:row") {
        void queryClient.invalidateQueries({ queryKey: ["attendance-live"] });
      }
    },
    [queryClient, filters]
  );

  const { connected } = useRfidStream(onSse, filters);

  const s = summary?.data;

  const pipeline = s
    ? [
        { label: "Present", count: s.presentToday, color: "bg-emerald-500" },
        { label: "Inside", count: s.insideNow, color: "bg-blue-500" },
        { label: "Exited", count: s.exitedToday, color: "bg-slate-400" },
        { label: "Absent", count: s.absentToday, color: "bg-red-500" },
        { label: "Late", count: s.lateToday, color: "bg-amber-500" },
        { label: "Overtime", count: s.overtimeNow, color: "bg-purple-500" },
      ]
    : [];

  const total = pipeline.reduce((acc, p) => acc + p.count, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Live floor view and today's attendance metrics."
        actions={<LiveIndicator connected={connected} />}
      />

      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <KpiGrid>
          <KpiCard title="Inside Now" value={s?.insideNow ?? 0} highlighted />
          <KpiCard title="Present" value={s?.presentToday ?? 0} />
          <KpiCard title="Absent" value={s?.absentToday ?? 0} />
          <KpiCard title="Late" value={s?.lateToday ?? 0} />
        </KpiGrid>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Status Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipeline.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <FilterBar>
        <Select value={department} onValueChange={(v) => { if (v) { setDepartment(v); setPage(1); } }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={shift} onValueChange={(v) => { if (v) { setShift(v); setPage(1); } }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Shift" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            {SHIFTS.map((s) => <SelectItem key={s} value={s}>{formatShift(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ATTENDANCE_STATUSES.map((st) => (
              <SelectItem key={st} value={st}>{st.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Live Floor</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {floorLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (floor?.data ?? []).length === 0 ? (
            <EmptyState
              title="No employees on the floor"
              description="Live attendance rows will appear when RFID events are detected."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>First Entry</TableHead>
                  <TableHead>Last Exit</TableHead>
                  <TableHead>Inside</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(floor?.data ?? []).map((row) => {
                  const emp = row.employee as Employee;
                  return (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">
                        {typeof emp === "object" ? emp.employeeName : "—"}
                      </TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell className="capitalize">{row.shift}</TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                      <TableCell>
                        {row.firstEntryAt ? format(new Date(row.firstEntryAt), "HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        {row.lastExitAt ? format(new Date(row.lastExitAt), "HH:mm") : "—"}
                      </TableCell>
                      <TableCell>{formatMinutes(row.totalInsideMinutes)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {floor?.pagination && floor.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {floor.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= floor.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
