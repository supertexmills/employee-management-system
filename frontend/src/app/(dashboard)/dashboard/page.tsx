"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Factory, Users, Zap } from "lucide-react";
import { format } from "date-fns";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import {
  LiveIndicator,
  PageHeader,
  EmptyState,
} from "@/components/dashboard/page-header";
import { DepartmentShiftFilters } from "@/components/filters/department-shift-filters";
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
import * as healthApi from "@/lib/api/health";
import * as productionApi from "@/lib/api/production";
import { useProductionStream } from "@/hooks/use-sse";
import {
  applyRoundEvent,
  patchLiveFromSnapshot,
  type ProductionRoundEvent,
} from "@/lib/production-live-cache";
import type { ProductionLive } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

const DashboardCharts = dynamic(
  () =>
    import("./dashboard-charts").then((mod) => ({ default: mod.DashboardCharts })),
  {
    loading: () => <PageSkeleton variant="chart" />,
    ssr: false,
  }
);

export default function DashboardPage() {
  const [department, setDepartment] = useState<string>("all");
  const [shift, setShift] = useState<string>("morning");
  const shiftManuallyChanged = useRef(false);
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      ...(department !== "all" ? { department } : {}),
      shift,
    }),
    [department, shift]
  );

  const onSse = useCallback(
    (event: string, data: unknown) => {
      if (event === "production:live") {
        const snapshot = data as ProductionLive;
        patchLiveFromSnapshot(queryClient, filters, snapshot);
        if (!shiftManuallyChanged.current && snapshot.currentShift) {
          setShift(snapshot.currentShift);
        }
      }
      if (event === "production:round") {
        applyRoundEvent(queryClient, filters, data as ProductionRoundEvent);
      }
    },
    [queryClient, filters]
  );

  const { connected } = useProductionStream(onSse, filters);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => healthApi.getHealth(),
    refetchInterval: 60_000,
  });

  const { data: live, isLoading: liveLoading } = useQuery({
    queryKey: queryKeys.productionLive(filters),
    queryFn: () => productionApi.getProductionLive(filters),
    refetchInterval: connected ? false : 10_000,
  });

  const { data: production, isLoading: productionLoading } = useQuery({
    queryKey: queryKeys.productionShiftSummary(filters),
    queryFn: () => productionApi.getProductionShiftSummary(filters),
    refetchInterval: connected ? 60_000 : 30_000,
  });

  const { data: recentRounds } = useQuery({
    queryKey: queryKeys.recentRounds(),
    queryFn: () => productionApi.listRounds({ limit: 10, page: 1 }),
    refetchInterval: connected ? 60_000 : 30_000,
  });

  useEffect(() => {
    const currentShift = live?.data?.currentShift;
    if (currentShift && !shiftManuallyChanged.current) {
      setShift(currentShift);
    }
  }, [live?.data?.currentShift]);

  const handleShiftChange = useCallback((value: string) => {
    shiftManuallyChanged.current = true;
    setShift(value);
  }, []);

  const liveData = live?.data;
  const prod = production?.data;
  const hourlyChart = prod?.hourlyTotals ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Live production rounds and shift performance across the factory floor."
        actions={<LiveIndicator connected={connected} />}
      />

      <DepartmentShiftFilters
        department={department}
        shift={shift}
        onDepartmentChange={setDepartment}
        onShiftChange={handleShiftChange}
      />

      {liveLoading ? (
        <PageSkeleton variant="kpi-grid" />
      ) : (
        <KpiGrid>
          <KpiCard
            title="Total Rounds"
            value={liveData?.totals.roundsTodayShift ?? prod?.totalRounds ?? 0}
            subtitle="This shift"
            highlighted
            icon={<Factory className="size-5" />}
          />
          <KpiCard
            title="Rounds This Hour"
            value={liveData?.totals.roundsThisHour ?? 0}
            subtitle="Live floor activity"
            icon={<Zap className="size-5" />}
          />
          <KpiCard
            title="Active Machines"
            value={prod?.activeMachines ?? liveData?.machines.length ?? 0}
            subtitle="Reporting production"
            icon={<Activity className="size-5" />}
          />
          <KpiCard
            title="Active Employees"
            value={prod?.activeEmployees ?? 0}
            subtitle={`Avg ${prod?.avgRoundsPerEmployee ?? 0} rounds / worker`}
            icon={<Users className="size-5" />}
          />
        </KpiGrid>
      )}

      <DashboardCharts hourlyChart={hourlyChart} productionLoading={productionLoading} />

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
          <CardTitle className="text-base font-semibold">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          {(recentRounds?.data ?? []).length === 0 ? (
            <EmptyState
              title="No recent rounds"
              description="Machine round events will stream here in real time."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Hour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentRounds?.data ?? []).map((round) => (
                  <TableRow key={round._id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(round.detectedAt), "HH:mm:ss")}
                    </TableCell>
                    <TableCell>{round.employeeName}</TableCell>
                    <TableCell>{round.machineId}</TableCell>
                    <TableCell>{round.shiftHourLabel}</TableCell>
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
