"use client";

import { HourlyRoundsChart } from "@/components/production/hourly-rounds-chart";
import { MachineStatusStrip } from "@/components/production/machine-status-strip";
import { PerformerLeaderboard } from "@/components/production/performer-leaderboard";
import { ProductionFilters } from "@/components/production/production-filters";
import { ProductionKpiGrid } from "@/components/production/production-kpi-grid";
import { RoundActivityFeed } from "@/components/production/round-activity-feed";
import { ShiftWindowBadge } from "@/components/production/shift-window-badge";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductionStream } from "@/hooks/useProductionStream";
import { productionApi } from "@/lib/api/production";
import type { Department, Shift } from "@/lib/constants/departments";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function ProductionPage() {
  const { canReadProduction, user } = useAuth();
  const router = useRouter();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");
  const [machineId, setMachineId] = useState("");
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    setTodayLabel(formatTodayLabel());
  }, []);

  useEffect(() => {
    if (!canReadProduction()) {
      router.replace("/settings");
    }
  }, [canReadProduction, router]);

  const filters = useMemo(
    () => ({
      ...(department ? { department } : {}),
      ...(shift ? { shift } : {}),
      ...(machineId ? { machineId } : {}),
    }),
    [department, shift, machineId],
  );

  const streamEnabled = canReadProduction();

  const {
    liveSnapshot,
    recentRounds,
    readerStatus,
    connected,
    reconnecting,
  } = useProductionStream({
    enabled: streamEnabled,
    filters,
  });

  const liveQuery = useQuery({
    queryKey: ["production", "live", filters],
    queryFn: () => productionApi.live(filters),
    enabled: streamEnabled && !connected,
    refetchInterval: connected ? false : 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["production", "summary", "today", filters],
    queryFn: () => productionApi.todaySummary(filters),
    enabled: streamEnabled,
    refetchInterval: connected ? false : 30_000,
  });

  const machinesQuery = useQuery({
    queryKey: ["production", "machines", "options"],
    queryFn: () => productionApi.listMachines({ limit: 50, isActive: true }),
    enabled: streamEnabled,
  });

  const snapshot = liveSnapshot ?? liveQuery.data;
  const todaySummary = summaryQuery.data;
  const machineOptions =
    machinesQuery.data?.data.map((m) => ({
      machineId: m.machineId,
      name: m.name,
    })) ?? [];

  if (!canReadProduction()) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Command"
        description={
          todayLabel
            ? `Spinning mill rounds · ${todayLabel}`
            : "Spinning mill rounds"
        }
        breadcrumbs={[{ label: "Production" }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ShiftWindowBadge
              shift={snapshot?.shift ?? todaySummary?.shift}
              shiftWindow={snapshot?.shiftWindow ?? null}
            />
            <LiveIndicator
              connected={connected}
              reconnecting={reconnecting}
              readerConnected={readerStatus?.connected}
            />
          </div>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Welcome back
          {user?.username ? (
            <span className="font-medium text-slate-900">, {user.username}</span>
          ) : null}
          . Monitor live machine rounds, shift totals, and hourly production pace.
        </p>
        <ProductionFilters
          department={department}
          shift={shift}
          machineId={machineId}
          machineOptions={machineOptions}
          onDepartmentChange={setDepartment}
          onShiftChange={setShift}
          onMachineIdChange={setMachineId}
          className="w-full shrink-0 md:max-w-2xl"
        />
      </div>

      {summaryQuery.isLoading && !snapshot && !todaySummary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProductionKpiGrid liveSnapshot={snapshot} todaySummary={todaySummary} />
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <HourlyRoundsChart data={todaySummary?.hourlyTotals ?? []} />
        <PerformerLeaderboard performers={todaySummary?.topPerformers ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RoundActivityFeed rounds={recentRounds.slice(0, 8)} />
        <MachineStatusStrip machines={snapshot?.machines ?? []} />
      </div>
    </div>
  );
}
