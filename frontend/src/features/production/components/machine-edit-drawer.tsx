"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as productionApi from "@/lib/api/production";
import { DEPARTMENTS, SHIFTS } from "@/lib/constants";
import type { Machine } from "@/lib/api/types";

type MachineEditDrawerProps = {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function MachineEditDrawer({
  machine,
  open,
  onOpenChange,
  onSaved,
}: MachineEditDrawerProps) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    department: "Production" as (typeof DEPARTMENTS)[number],
    defaultShift: "morning" as (typeof SHIFTS)[number],
    targetRoundsPerShift: 100,
    minRoundIntervalSeconds: 30,
  });

  useEffect(() => {
    if (machine) {
      setForm({
        name: machine.name,
        location: machine.location,
        department: machine.department,
        defaultShift: machine.defaultShift,
        targetRoundsPerShift: machine.targetRoundsPerShift,
        minRoundIntervalSeconds: machine.minRoundIntervalSeconds,
      });
    }
  }, [machine]);

  const updateMutation = useMutation({
    mutationFn: () =>
      productionApi.updateMachine(machine!.machineId, form),
    onSuccess: () => {
      toast.success("Machine updated");
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Machine</SheetTitle>
        </SheetHeader>
        {machine && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Machine ID</Label>
              <Input value={machine.machineId} disabled />
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Rounds / Shift</Label>
              <Input
                type="number"
                value={form.targetRoundsPerShift}
                onChange={(e) =>
                  setForm({ ...form, targetRoundsPerShift: Number(e.target.value) })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
