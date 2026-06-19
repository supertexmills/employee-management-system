"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import * as productionApi from "@/lib/api/production";
import type { MachineRound } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export default function ProductionRoundsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.rounds(page),
    queryFn: () => productionApi.listRounds({ page, limit: 30 }),
    refetchInterval: 30_000,
  });

  const rounds = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Rounds"
        subtitle="Audit trail of machine round events."
      />

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <DataTable<MachineRound>
            columns={[
              {
                key: "time",
                header: "Time",
                cell: (round) => (
                  <span className="text-muted-foreground">
                    {format(new Date(round.detectedAt), "MMM d, HH:mm:ss")}
                  </span>
                ),
              },
              {
                key: "employee",
                header: "Employee",
                cell: (round) => (
                  <span className="font-medium">{round.employeeName}</span>
                ),
              },
              { key: "machine", header: "Machine", cell: (round) => round.machineId },
              { key: "department", header: "Department", cell: (round) => round.department },
              {
                key: "shift",
                header: "Shift",
                cell: (round) => (
                  <span className="capitalize">{round.shift}</span>
                ),
              },
              { key: "hour", header: "Hour", cell: (round) => round.shiftHourLabel },
            ]}
            data={rounds}
            rowKey={(round) => round._id}
            isLoading={isLoading}
            emptyTitle="No rounds recorded"
            emptyDescription="Production round events will appear here once machines start reporting."
            pagination={data?.pagination}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
