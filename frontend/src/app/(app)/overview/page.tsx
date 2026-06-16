"use client";

import { PageHeader } from "@/components/dashboard/shell/page-header";
import { AttendanceSnapshot } from "@/components/monitor/attendance-snapshot";
import { LiveActivityFeed } from "@/components/monitor/live-activity-feed";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { MonitorFilters } from "@/components/monitor/monitor-filters";
import { MonitorKpiGrid } from "@/components/monitor/monitor-kpi-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useRfidStream } from "@/hooks/useRfidStream";
import { attendanceApi } from "@/lib/api/attendance";
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

export default function OverviewPage() {
  const { canReadAttendance, user } = useAuth();
  const router = useRouter();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    setTodayLabel(formatTodayLabel());
  }, []);

  useEffect(() => {
    if (!canReadAttendance()) {
      router.replace("/settings");
    }
  }, [canReadAttendance, router]);

  const filters = useMemo(
    () => ({
      ...(department ? { department } : {}),
      ...(shift ? { shift } : {}),
    }),
    [department, shift],
  );

  const streamEnabled = canReadAttendance();

  const {
    summary: streamSummary,
    recentEvents,
    snapshotRows,
    readerStatus,
    connected,
    reconnecting,
  } = useRfidStream({
    enabled: streamEnabled,
    filters,
    hydrateSnapshot: true,
    snapshotLimit: 8,
  });

  const summaryQuery = useQuery({
    queryKey: ["overview", "attendance-summary", filters],
    queryFn: () => attendanceApi.todaySummary(filters),
    enabled: streamEnabled && !connected,
    refetchInterval: connected ? false : 30_000,
  });

  const snapshotQuery = useQuery({
    queryKey: ["overview", "attendance-snapshot", filters],
    queryFn: () => attendanceApi.liveFloor({ ...filters, page: 1, limit: 8 }),
    enabled: streamEnabled && !connected,
    refetchInterval: connected ? false : 30_000,
  });

  const summary = streamSummary ?? summaryQuery.data;
  const attendanceRows = connected
    ? snapshotRows
    : (snapshotQuery.data?.data ?? []);

  if (!canReadAttendance()) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Floor Monitor"
        description={
          todayLabel
            ? `Today's workforce · ${todayLabel}`
            : "Today's workforce"
        }
        breadcrumbs={[{ label: "Dashboard" }]}
        action={
          <LiveIndicator
            connected={connected}
            reconnecting={reconnecting}
            readerConnected={readerStatus?.connected}
          />
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Welcome back
          {user?.username ? (
            <span className="font-medium text-slate-900">, {user.username}</span>
          ) : null}
          . Track present, absent, and live floor presence for factory employees.
        </p>
        <MonitorFilters
          department={department}
          shift={shift}
          onDepartmentChange={setDepartment}
          onShiftChange={setShift}
          className="w-full shrink-0 md:max-w-md"
        />
      </div>

      {summaryQuery.isLoading && !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <MonitorKpiGrid summary={summary} />
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <LiveActivityFeed events={recentEvents.slice(0, 8)} />
        <AttendanceSnapshot
          rows={attendanceRows}
          isLoading={!connected && snapshotQuery.isLoading}
        />
      </div>
    </div>
  );
}
