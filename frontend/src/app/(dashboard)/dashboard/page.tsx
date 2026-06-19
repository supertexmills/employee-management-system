"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Factory,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import {
  LiveIndicator,
  PageHeader,
  EmptyState,
} from "@/components/dashboard/page-header";
import { DepartmentShiftFilters } from "@/components/filters/department-shift-filters";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
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
import * as healthApi from "@/lib/api/health";
import * as productionApi from "@/lib/api/production";
import * as rfidApi from "@/lib/api/rfid";
import type { AttendanceSummary } from "@/lib/api/types";
import { useRfidStream } from "@/hooks/use-sse";

const DashboardCharts = dynamic(
  () =>
    import("./dashboard-charts").then((mod) => ({ default: mod.DashboardCharts })),
  {
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <PageSkeleton variant="chart" />
        <PageSkeleton variant="chart" />
      </div>
    ),
    ssr: false,
  }
);

export default function DashboardPage() {
  const [department, setDepartment] = useState<string>("all");
  const [shift, setShift] = useState<string>("all");
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      ...(department !== "all" ? { department } : {}),
      ...(shift !== "all" ? { shift } : {}),
    }),
    [department, shift]
  );

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 60_000,
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-summary", filters],
    queryFn: () => attendanceApi.getTodaySummary(filters),
    refetchInterval: 30_000,
  });

  const { data: production, isLoading: productionLoading } = useQuery({
    queryKey: ["production-summary", filters],
    queryFn: () => productionApi.getProductionTodaySummary(filters),
    refetchInterval: 30_000,
  });

  const { data: events } = useQuery({
    queryKey: ["recent-rfid"],
    queryFn: () => rfidApi.listRfidEvents({ limit: 10, page: 1 }),
    refetchInterval: 30_000,
  });

  const onSse = useCallback(
    (event: string, data: unknown) => {
      if (event === "attendance:summary") {
        queryClient.setQueryData(["attendance-summary", filters], {
          success: true,
          data: data as AttendanceSummary,
        });
      }
    },
    [queryClient, filters]
  );

  const { connected } = useRfidStream(onSse, filters);

  const summary = attendance?.data;
  const prod = production?.data;

  const attendanceChart = summary
    ? [
        { name: "Present", value: summary.presentToday },
        { name: "Inside", value: summary.insideNow },
        { name: "Absent", value: summary.absentToday },
        { name: "Late", value: summary.lateToday },
        { name: "Overtime", value: summary.overtimeNow },
      ]
    : [];

  const hourlyChart = prod?.hourlyTotals ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="A quick view of factory attendance and production updates."
        actions={<LiveIndicator connected={connected} />}
      />

      <DepartmentShiftFilters
        department={department}
        shift={shift}
        onDepartmentChange={setDepartment}
        onShiftChange={setShift}
      />

      {attendanceLoading ? (
        <PageSkeleton variant="kpi-grid" />
      ) : (
        <KpiGrid>
          <KpiCard
            title="Inside Now"
            value={summary?.insideNow ?? 0}
            subtitle={`${summary?.totalActive ?? 0} active employees`}
            highlighted
            icon={<Users className="size-5" />}
          />
          <KpiCard
            title="Present Today"
            value={summary?.presentToday ?? 0}
            subtitle="Checked in today"
            icon={<CheckCircle2 className="size-5" />}
          />
          <KpiCard
            title="Total Rounds"
            value={prod?.totalRounds ?? 0}
            subtitle={`${prod?.activeEmployees ?? 0} active on floor`}
            icon={<Factory className="size-5" />}
          />
          <KpiCard
            title="Late Today"
            value={summary?.lateToday ?? 0}
            subtitle={`${summary?.absentToday ?? 0} absent`}
            icon={<AlertTriangle className="size-5" />}
          />
        </KpiGrid>
      )}

      <DashboardCharts
        attendanceChart={attendanceChart}
        hourlyChart={hourlyChart}
        attendanceLoading={attendanceLoading}
        productionLoading={productionLoading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <HealthRow
                  label="Database"
                  ok={health?.db === "ok"}
                  detail={health?.db ?? "unknown"}
                />
                <HealthRow
                  label="RFID Reader"
                  ok={health?.rfid?.connected ?? false}
                  detail={health?.rfid?.connected ? "Connected" : "Disconnected"}
                />
                <HealthRow
                  label="Active Machines"
                  ok={(health?.production?.machinesActive ?? 0) > 0}
                  detail={`${health?.production?.machinesActive ?? 0} machines`}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {productionLoading ? (
              <PageSkeleton variant="table" />
            ) : (prod?.topPerformers ?? []).length === 0 ? (
              <EmptyState
                title="No production data yet"
                description="Production rounds will appear here once machines start reporting."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead className="text-right">Rounds</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(prod?.topPerformers ?? []).slice(0, 5).map((p, i) => (
                    <TableRow key={`${p.employeeName}-${i}`}>
                      <TableCell className="font-medium">{p.employeeName}</TableCell>
                      <TableCell>{p.machineId}</TableCell>
                      <TableCell className="text-right">{p.totalRounds}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent RFID Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {(events?.data ?? []).length === 0 ? (
            <EmptyState
              title="No recent RFID events"
              description="Gate reader activity will stream here in real time."
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(events?.data ?? []).map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(event.detectedAt), "HH:mm:ss")}
                  </TableCell>
                  <TableCell>{event.employeeName ?? event.epc}</TableCell>
                  <TableCell>
                    <StatusBadge status={event.action} />
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getHealth() {
  return healthApi.getHealth();
}

function HealthRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span
        className={`size-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
    </div>
  );
}
