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
import type { ProductionReader } from "@/lib/api/types";

type ReaderEditDrawerProps = {
  reader: ProductionReader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function ReaderEditDrawer({
  reader,
  open,
  onOpenChange,
  onSaved,
}: ReaderEditDrawerProps) {
  const [form, setForm] = useState({
    type: "MACHINE" as "MACHINE" | "GATE",
    ip: "",
    port: 200,
    location: "",
  });

  useEffect(() => {
    if (reader) {
      setForm({
        type: reader.type,
        ip: reader.ip,
        port: reader.port,
        location: reader.location,
      });
    }
  }, [reader]);

  const updateMutation = useMutation({
    mutationFn: () => productionApi.updateReader(reader!.readerId, form),
    onSuccess: () => {
      toast.success("Reader updated");
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Reader</SheetTitle>
        </SheetHeader>
        {reader && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Reader ID</Label>
              <Input value={reader.readerId} disabled />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  v && setForm({ ...form, type: v as typeof form.type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
