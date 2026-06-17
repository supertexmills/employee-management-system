"use client";

import { PageHeader } from "@/components/dashboard/shell/page-header";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/dashboard/tables/data-table";
import { ResponsiveTable } from "@/components/dashboard/tables/responsive-table";
import { RecordCard, RecordCardHeader, RecordCardRow } from "@/components/dashboard/tables/record-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { productionApi } from "@/lib/api/production";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProductionMachinesPage() {
  const router = useRouter();
  const { canReadProduction } = useAuth();

  useEffect(() => {
    if (!canReadProduction()) {
      router.replace("/settings");
    }
  }, [canReadProduction, router]);

  const machinesQuery = useQuery({
    queryKey: ["production", "machines", "list"],
    queryFn: () => productionApi.listMachines({ limit: 50 }),
    enabled: canReadProduction(),
  });

  const readersQuery = useQuery({
    queryKey: ["production", "readers", "status"],
    queryFn: () => productionApi.readersStatus(),
    enabled: canReadProduction(),
    refetchInterval: 30_000,
  });

  const readerByMachineId = new Map(
    (readersQuery.data ?? [])
      .filter((r) => r.machineId)
      .map((r) => [r.machineId as string, r]),
  );

  if (!canReadProduction()) {
    return null;
  }

  const machines = machinesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machines"
        description="Spinning mill machines and reader connectivity."
        breadcrumbs={[
          { label: "Production", href: "/production" },
          { label: "Machines" },
        ]}
      />

      {machinesQuery.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <ResponsiveTable
          data={machines}
          keyExtractor={(machine) => machine._id}
          renderMobileCard={(machine) => {
            const reader = readerByMachineId.get(machine.machineId);
            return (
              <RecordCard key={machine._id}>
                <RecordCardHeader
                  title={machine.name}
                  subtitle={machine.machineId}
                  trailing={
                    <Link
                      href={`/production/machines/${machine.machineId}`}
                      className="text-sm font-medium text-primary"
                    >
                      View
                    </Link>
                  }
                />
                <RecordCardRow label="Location">{machine.location}</RecordCardRow>
                <RecordCardRow label="Reader">
                  {machine.reader?.readerId ?? "—"}
                </RecordCardRow>
                <RecordCardRow label="Status">
                  {reader?.connected ? "Online" : "Offline"}
                </RecordCardRow>
              </RecordCard>
            );
          }}
        >
          <DataTable>
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead>Machine</DataTableHead>
                  <DataTableHead>Location</DataTableHead>
                  <DataTableHead>Reader</DataTableHead>
                  <DataTableHead>Status</DataTableHead>
                  <DataTableHead className="text-right">Actions</DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {machines.map((machine) => {
                  const reader = readerByMachineId.get(machine.machineId);
                  return (
                    <DataTableRow key={machine._id}>
                      <DataTableCell>
                        <div>
                          <p className="font-medium text-slate-900">{machine.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {machine.machineId}
                          </p>
                        </div>
                      </DataTableCell>
                      <DataTableCell>{machine.location}</DataTableCell>
                      <DataTableCell>
                        {machine.reader?.readerId ?? "—"}
                      </DataTableCell>
                      <DataTableCell>
                        <span
                          className={
                            reader?.connected
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }
                        >
                          {reader?.connected ? "Online" : "Offline"}
                        </span>
                        {reader?.lastSeenAt ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(reader.lastSeenAt)}
                          </p>
                        ) : null}
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <Link
                          href={`/production/machines/${machine.machineId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View summary
                        </Link>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
        </ResponsiveTable>
      )}
    </div>
  );
}
