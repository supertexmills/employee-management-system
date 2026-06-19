"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { LiveIndicator, PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as rfidApi from "@/lib/api/rfid";
import type { RfidEvent } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { useRfidStream } from "@/hooks/use-sse";

export default function RfidPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: queryKeys.rfidEvents({ page }),
    queryFn: () => rfidApi.listRfidEvents({ page, limit: 30 }),
    refetchInterval: 30_000,
  });

  const { data: unknown } = useQuery({
    queryKey: ["unknown-tags"],
    queryFn: () => rfidApi.listUnknownTags({ limit: 20 }),
    refetchInterval: 30_000,
  });

  const { data: readerStatus } = useQuery({
    queryKey: ["gate-reader-status"],
    queryFn: () => rfidApi.getReaderStatus(),
    refetchInterval: 15_000,
  });

  const onSse = useCallback(
    (event: string) => {
      if (event === "rfid:event") {
        void queryClient.invalidateQueries({ queryKey: ["rfid-events"] });
      }
    },
    [queryClient]
  );

  const { connected } = useRfidStream(onSse);

  const reader = readerStatus?.data;
  const eventRows = events?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFID Monitor"
        subtitle="Gate reader events, unknown tags, and live activity stream."
        actions={<LiveIndicator connected={connected} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gate Reader
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{reader?.readerId ?? "—"}</p>
              <StatusBadge status={reader?.connected ? "active" : "inactive"} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {reader?.location ?? "Main Gate"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <CardTitle className="text-sm font-medium">
              Unknown Tags ({unknown?.pagination?.total ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(unknown?.data ?? []).slice(0, 8).map((tag) => (
                <span
                  key={tag.epc}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                >
                  {tag.epc}
                </span>
              ))}
              {(unknown?.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No unknown tags</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Event Log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-4">
          <DataTable<RfidEvent>
            columns={[
              {
                key: "time",
                header: "Time",
                cell: (event) => (
                  <span className="text-muted-foreground">
                    {format(new Date(event.detectedAt), "MMM d HH:mm:ss")}
                  </span>
                ),
              },
              {
                key: "epc",
                header: "EPC",
                cell: (event) => (
                  <span className="font-mono text-xs">{event.epc}</span>
                ),
              },
              {
                key: "employee",
                header: "Employee",
                cell: (event) => event.employeeName ?? "—",
              },
              {
                key: "action",
                header: "Action",
                cell: (event) => <StatusBadge status={event.action} />,
              },
              { key: "reader", header: "Reader", cell: (event) => event.readerId },
              { key: "location", header: "Location", cell: (event) => event.location },
            ]}
            data={eventRows}
            rowKey={(event) => event._id}
            isLoading={isLoading}
            emptyTitle="No RFID events"
            emptyDescription="Gate reader events will stream here in real time."
            pagination={events?.pagination}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
