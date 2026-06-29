"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { MachineEditDrawer } from "@/features/production/components/machine-edit-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { DEPARTMENTS, SHIFTS } from "@/lib/constants";
import type { Machine } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export default function MachinesPage() {
  const [open, setOpen] = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [form, setForm] = useState({
    machineId: "",
    name: "",
    department: "Production" as (typeof DEPARTMENTS)[number],
    defaultShift: "morning" as (typeof SHIFTS)[number],
    location: "",
    targetRoundsPerShift: 100,
    minRoundIntervalSeconds: 30,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.machines(),
    queryFn: () => productionApi.listMachines({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () => productionApi.createMachine(form),
    onSuccess: () => {
      toast.success("Machine created");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.machines() });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productionApi.deleteMachine(id),
    onSuccess: () => {
      toast.success("Machine deactivated");
      setDeactivateId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.machines() });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const machines = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machines"
        subtitle="Configure production machines and round targets."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Machine
          </Button>
        }
      />

      <Card className="shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <DataTable<Machine>
            columns={[
              {
                key: "machineId",
                header: "ID",
                cell: (m) => <span className="font-mono text-xs">{m.machineId}</span>,
              },
              {
                key: "name",
                header: "Name",
                cell: (m) => <span className="font-medium">{m.name}</span>,
              },
              { key: "department", header: "Department", cell: (m) => m.department },
              {
                key: "shift",
                header: "Shift",
                cell: (m) => <span className="capitalize">{m.defaultShift}</span>,
              },
              {
                key: "target",
                header: "Target Rounds",
                cell: (m) => m.targetRoundsPerShift,
              },
              {
                key: "status",
                header: "Status",
                cell: (m) => (
                  <StatusBadge status={m.isActive ? "active" : "inactive"} />
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                cell: (m) =>
                  m.isActive ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMachine(m)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeactivateId(m.machineId)}
                      >
                        Deactivate
                      </Button>
                    </div>
                  ) : null,
              },
            ]}
            data={machines}
            rowKey={(m) => m._id}
            isLoading={isLoading}
            emptyTitle="No machines configured"
            emptyDescription="Add a machine to start tracking production rounds."
          />
        </CardContent>
      </Card>

      <MachineEditDrawer
        machine={editMachine}
        open={!!editMachine}
        onOpenChange={(open) => !open && setEditMachine(null)}
        onSaved={() =>
          void queryClient.invalidateQueries({ queryKey: queryKeys.machines() })
        }
      />

      <ConfirmDialog
        open={!!deactivateId}
        onOpenChange={(open) => !open && setDeactivateId(null)}
        title="Deactivate machine?"
        description="This machine will stop accepting production rounds."
        confirmLabel="Deactivate"
        loading={deleteMutation.isPending}
        onConfirm={() => deactivateId && deleteMutation.mutate(deactivateId)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Machine ID</Label>
              <Input
                value={form.machineId}
                onChange={(e) => setForm({ ...form, machineId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) =>
                    v && setForm({ ...form, department: v as typeof form.department })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Shift</Label>
                <Select
                  value={form.defaultShift}
                  onValueChange={(v) =>
                    v && setForm({ ...form, defaultShift: v as typeof form.defaultShift })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              Create Machine
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
