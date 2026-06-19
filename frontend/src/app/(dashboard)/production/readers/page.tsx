"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { ReaderEditDrawer } from "@/features/production/components/reader-edit-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as productionApi from "@/lib/api/production";
import type { ProductionReader } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export default function ReadersPage() {
  const [open, setOpen] = useState(false);
  const [editReader, setEditReader] = useState<ProductionReader | null>(null);
  const [form, setForm] = useState({
    readerId: "",
    type: "MACHINE" as "MACHINE" | "GATE",
    ip: "",
    port: 200,
    location: "",
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.productionReaders(),
    queryFn: () => productionApi.listReaders({ limit: 50 }),
  });

  const { data: statusData } = useQuery({
    queryKey: queryKeys.readersStatus(),
    queryFn: () => productionApi.getReadersStatus(),
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: () => productionApi.createReader(form),
    onSuccess: () => {
      toast.success("Reader created");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.productionReaders() });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMap = new Map(
    (statusData?.data ?? []).map((s) => [s.readerId, s.connected])
  );

  const readers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Readers"
        subtitle="RFID reader hardware configuration for machines and gates."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Reader
          </Button>
        }
      />

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <DataTable<ProductionReader>
            columns={[
              {
                key: "readerId",
                header: "Reader ID",
                cell: (r) => <span className="font-mono text-xs">{r.readerId}</span>,
              },
              { key: "type", header: "Type", cell: (r) => r.type },
              {
                key: "ip",
                header: "IP",
                cell: (r) => `${r.ip}:${r.port}`,
              },
              { key: "location", header: "Location", cell: (r) => r.location },
              {
                key: "connection",
                header: "Connection",
                cell: (r) => (
                  <StatusBadge
                    status={statusMap.get(r.readerId) ? "active" : "inactive"}
                  />
                ),
              },
              {
                key: "lastSeen",
                header: "Last Seen",
                cell: (r) =>
                  r.lastSeenAt
                    ? format(new Date(r.lastSeenAt), "MMM d HH:mm")
                    : "—",
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <StatusBadge status={r.isActive ? "active" : "inactive"} />
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                cell: (r) =>
                  r.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditReader(r)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null,
              },
            ]}
            data={readers}
            rowKey={(r) => r._id}
            isLoading={isLoading}
            emptyTitle="No readers configured"
            emptyDescription="Register RFID readers to connect machines and gates."
          />
        </CardContent>
      </Card>

      <ReaderEditDrawer
        reader={editReader}
        open={!!editReader}
        onOpenChange={(open) => !open && setEditReader(null)}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.productionReaders() });
          void queryClient.invalidateQueries({ queryKey: queryKeys.readersStatus() });
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reader</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reader ID</Label>
              <Input
                value={form.readerId}
                onChange={(e) => setForm({ ...form, readerId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  v && setForm({ ...form, type: v as typeof form.type })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MACHINE">MACHINE</SelectItem>
                  <SelectItem value="GATE">GATE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP Address</Label>
                <Input
                  value={form.ip}
                  onChange={(e) => setForm({ ...form, ip: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  type="number"
                  value={form.port}
                  onChange={(e) =>
                    setForm({ ...form, port: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              Create Reader
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
