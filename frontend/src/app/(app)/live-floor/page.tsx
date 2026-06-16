"use client";

import { PageHeader } from "@/components/dashboard/shell/page-header";
import { LiveActivityFeed } from "@/components/monitor/live-activity-feed";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { MonitorFilters } from "@/components/monitor/monitor-filters";
import { useRfidStream } from "@/hooks/useRfidStream";
import type { Department, Shift } from "@/lib/constants/departments";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function LiveFloorPage() {
  const router = useRouter();
  const { canReadAttendance } = useAuth();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");

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

  const { recentEvents, readerStatus, connected, reconnecting } = useRfidStream({
    enabled: canReadAttendance(),
    filters,
  });

  if (!canReadAttendance()) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Gate"
        description="Real-time RFID gate reads across the factory entrance."
        breadcrumbs={[
          { label: "Floor Monitor", href: "/overview" },
          { label: "Live Gate" },
        ]}
        action={
          <LiveIndicator
            connected={connected}
            reconnecting={reconnecting}
            readerConnected={readerStatus?.connected}
          />
        }
      />

      <MonitorFilters
        department={department}
        shift={shift}
        onDepartmentChange={setDepartment}
        onShiftChange={setShift}
        className="w-full max-w-md"
      />

      <LiveActivityFeed
        events={recentEvents}
        title="Gate activity stream"
        description="Every tag read at the main gate, updated in real time."
      />
    </div>
  );
}
