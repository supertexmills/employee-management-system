"use client";

import { ProductionFilters } from "@/components/production/production-filters";
import { RoundActivityFeed } from "@/components/production/round-activity-feed";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { useProductionStream } from "@/hooks/useProductionStream";
import { productionApi } from "@/lib/api/production";
import type { Department, Shift } from "@/lib/constants/departments";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProductionLivePage() {
  const router = useRouter();
  const { canReadProduction } = useAuth();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");
  const [machineId, setMachineId] = useState("");

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

  const { recentRounds, readerStatus, connected, reconnecting } =
    useProductionStream({
      enabled: canReadProduction(),
      filters,
    });

  const machinesQuery = useQuery({
    queryKey: ["production", "machines", "options"],
    queryFn: () => productionApi.listMachines({ limit: 50, isActive: true }),
    enabled: canReadProduction(),
  });

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
        title="Live Rounds"
        description="Real-time round events as employees pass machine readers."
        breadcrumbs={[
          { label: "Production", href: "/production" },
          { label: "Live Rounds" },
        ]}
        action={
          <LiveIndicator
            connected={connected}
            reconnecting={reconnecting}
            readerConnected={readerStatus?.connected}
          />
        }
      />

      <ProductionFilters
        department={department}
        shift={shift}
        machineId={machineId}
        machineOptions={machineOptions}
        onDepartmentChange={setDepartment}
        onShiftChange={setShift}
        onMachineIdChange={setMachineId}
        className="w-full max-w-2xl"
      />

      <RoundActivityFeed
        rounds={recentRounds}
        title="Round activity stream"
        description="Every accepted round at the machine reader, updated in real time."
      />
    </div>
  );
}
