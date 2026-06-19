"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Factory, Wifi, WifiOff } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { LiveIndicator, PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/page-header";
import { DepartmentShiftFilters } from "@/components/filters/department-shift-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import * as productionApi from "@/lib/api/production";
import type { ProductionLive } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useProductionStream } from "@/hooks/use-sse";
import { formatShift } from "@/lib/utils";

const ProductionHourlyChart = dynamic(
  () =>
    import("@/features/production/components/production-charts").then((mod) => ({
      default: mod.ProductionHourlyChart,
    })),
  {
    loading: () => <PageSkeleton variant="chart" />,
    ssr: false,
  }
);

export default function ProductionPage() {
  const [department, setDepartment] = useState("all");
  const [shift, setShift] = useState("morning");
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      ...(department !== "all" ? { department } : {}),
      shift,
    }),
    [department, shift]
  );

  const { data: live, isLoading: liveLoading } = useQuery({
    queryKey: queryKeys.productionLive(filters),
    queryFn: () => productionApi.getProductionLive(filters),
    refetchInterval: 10_000,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.productionShiftSummary(filters),
    queryFn: () => productionApi.getProductionShiftSummary(filters),
    refetchInterval: 30_000,
  });

  const onSse = useCallback(
    (event: string, data: unknown) => {
      if (event === "production:live") {
        queryClient.setQueryData(queryKeys.productionLive(filters), {
          success: true,
          data: data as ProductionLive,
        });
      }
    },
    [queryClient, filters]
  );

  const { connected } = useProductionStream(onSse, filters);

  const liveData = live?.data;
  const sum = summary?.data;
  const machines = liveData?.machines ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production"
        subtitle="Live machine rounds and shift-level production analytics."
        actions={<LiveIndicator connected={connected} />}
      />

      <DepartmentShiftFilters
        department={department}
        shift={shift}
        onDepartmentChange={setDepartment}
        onShiftChange={setShift}
        includeAllShifts={false}
      />

      {summaryLoading ? (
        <PageSkeleton variant="kpi-grid" />
      ) : (
        <KpiGrid>
          <KpiCard
            title="Total Rounds"
            value={sum?.totalRounds ?? 0}
            subtitle={`Shift: ${formatShift(shift)}`}
            highlighted
            icon={<Factory className="size-5" />}
          />
          <KpiCard title="Rounds This Hour" value={liveData?.totals.roundsThisHour ?? 0} />
          <KpiCard title="Active Machines" value={sum?.activeMachines ?? 0} />
          <KpiCard title="Active Employees" value={sum?.activeEmployees ?? 0} />
        </KpiGrid>
      )}

      {liveLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PageSkeleton key={i} variant="chart" className="h-40" />
          ))}
        </div>
      ) : machines.length === 0 ? (
        <EmptyState
          title="No machines reporting"
          description="Configure machines and readers to start tracking production."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <Card key={machine.machineId} className="shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">{machine.name}</CardTitle>
                {machine.readerConnected ? (
                  <Wifi className="size-4 text-emerald-500" />
                ) : (
                  <WifiOff className="size-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift Rounds</span>
                  <span className="font-semibold">{machine.totalRoundsShift}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Hour</span>
                  <span className="font-semibold">{machine.roundsThisHour}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Workers</span>
                  <span className="font-semibold">{machine.activeEmployees}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last round:{" "}
                  {machine.lastRoundAt
                    ? format(new Date(machine.lastRoundAt), "HH:mm:ss")
                    : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductionHourlyChart
        data={sum?.hourlyTotals ?? []}
        loading={summaryLoading}
      />
    </div>
  );
}
