"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import * as employeesApi from "@/lib/api/employees";
import { DEPARTMENTS, SHIFTS } from "@/lib/constants";
import type { Employee } from "@/lib/api/types";

import type { Department, Shift } from "@/lib/constants";

type FormData = {
  employeeName: string;
  phoneNumber: string;
  department: Department;
  designation: string;
  rfid: string;
  shift: Shift;
};

function validateForm(values: FormData): string | null {
  if (values.employeeName.length < 3) return "Name must be at least 3 characters";
  if (!/^[0-9]{10}$/.test(values.phoneNumber)) return "Phone must be 10 digits";
  if (!values.designation.trim()) return "Designation is required";
  if (!values.rfid.trim()) return "RFID tag is required";
  return null;
}

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  onSuccess?: () => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!employee;

  const form = useForm<FormData>({
    defaultValues: employee
      ? {
          employeeName: employee.employeeName,
          phoneNumber: employee.phoneNumber,
          department: employee.department,
          designation: employee.designation,
          rfid: employee.rfid,
          shift: employee.shift,
        }
      : {
          employeeName: "",
          phoneNumber: "",
          department: "Production",
          designation: "",
          rfid: "",
          shift: "morning",
        },
  });

  async function onSubmit(values: FormData) {
    const error = validateForm(values);
    if (error) {
      toast.error(error);
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await employeesApi.updateEmployee(employee._id, values);
        toast.success("Employee updated");
      } else {
        await employeesApi.createEmployee(values);
        toast.success("Employee created");
      }
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...form.register("employeeName")} />
          </div>
          <div className="space-y-2">
            <Label>Phone (10 digits)</Label>
            <Input {...form.register("phoneNumber")} />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input {...form.register("designation")} />
          </div>
          <div className="space-y-2">
            <Label>RFID Tag</Label>
            <Input {...form.register("rfid")} className="font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.watch("department")}
                onValueChange={(v) =>
                  v && form.setValue("department", v as FormData["department"])
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
              <Label>Shift</Label>
              <Select
                value={form.watch("shift")}
                onValueChange={(v) => v && form.setValue("shift", v as FormData["shift"])}
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
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
