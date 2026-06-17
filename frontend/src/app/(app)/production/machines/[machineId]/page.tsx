"use client";

import { MachineSummaryTable } from "@/components/production/machine-summary-table";
import { ProductionFilters } from "@/components/production/production-filters";
import { ProductionKpiGrid } from "@/components/production/production-kpi-grid";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { productionApi } from "@/lib/api/production";
import type { Department, Shift } from "@/lib/constants/departments";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProductionMachineDetailPage() {
  const params = useParams<{ machineId: string }>();
  const machineId = params.machineId;
  const router = useRouter();
  const { canReadProduction } = useAuth();
  const [department, setDepartment] = useState<Department | "">("");
  const [shift, setShift] = useState<Shift | "">("");

  useEffect(() => {
    if (!canReadProduction()) {
      router.replace("/settings");
    }
  }, [canReadProduction, router]);

  const filters = useMemo(
    () => ({
      ...(department ? { department } : {}),
      ...(shift ? { shift } : {}),
    }),
    [department, shift],
  );

  const summaryQuery = useQuery({
    queryKey: ["production", "machines", machineId, "summary", filters],
    queryFn: () => productionApi.machineSummary(machineId, filters),
    enabled: canReadProduction() && Boolean(machineId),
  });

  const liveQuery = useQuery({
    queryKey: ["production", "live", { machineId }],
    queryFn: () => productionApi.live({ machineId }),
    enabled: canReadProduction() && Boolean(machineId),
    refetchInterval: 30_000,
  });

  if (!canReadProduction()) {
    return null;
  }

  const machine = summaryQuery.data?.machine;
  const summaries = summaryQuery.data?.summaries ?? [];
  const machineLive = liveQuery.data?.machines.find(
    (m) => m.machineId === machineId,
  );

  const liveSnapshot = liveQuery.data
    ? {
        ...liveQuery.data,
        machines: machineLive ? [machineLive] : [],
        totals: liveQuery.data.totals,
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={machine?.name ?? machineId}
        description={machine?.location ?? "Machine production summary"}
        breadcrumbs={[
          { label: "Production", href: "/production" },
          { label: "Machines", href: "/production/machines" },
          { label: machineId },
        ]}
      />

      <ProductionFilters
        department={department}
        shift={shift}
        onDepartmentChange={setDepartment}
        onShiftChange={setShift}
        className="w-full max-w-md"
      />

      {summaryQuery.isLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : (
        <ProductionKpiGrid liveSnapshot={liveSnapshot} />
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Employee rounds
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Per-employee round totals for this machine in the selected shift.
          </p>
        </div>
        {summaryQuery.isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <MachineSummaryTable summaries={summaries} />
        )}
      </div>
    </div>
  );
}
