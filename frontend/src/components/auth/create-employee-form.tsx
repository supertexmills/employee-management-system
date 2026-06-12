"use client";

import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { employeesApi } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";
import {
  DEPARTMENTS,
  SHIFTS,
  SHIFT_LABELS,
} from "@/lib/constants/departments";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createEmployeeSchema = z.object({
  employeeName: z.string().trim().min(3).max(100),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  department: z.enum(DEPARTMENTS),
  designation: z.string().trim().min(1),
  rfid: z.string().trim().min(1),
  shift: z.enum(SHIFTS),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>;

export function CreateEmployeeForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      employeeName: "",
      phoneNumber: "",
      department: DEPARTMENTS[0],
      designation: "",
      rfid: "",
      shift: SHIFTS[0],
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const { street, city, state, pincode, ...employee } = values;
    const hasAddress = street || city || state || pincode;

    try {
      await employeesApi.create({
        ...employee,
        address: hasAddress ? { street, city, state, pincode } : undefined,
      });
      toast.success("Employee created successfully");
      router.push("/workforce");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to create employee",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm shadow-slate-900/5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="employeeName">Full name</Label>
          <Input id="employeeName" {...register("employeeName")} />
          {errors.employeeName ? (
            <p className="text-xs text-red-600">{errors.employeeName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input id="phoneNumber" {...register("phoneNumber")} />
          {errors.phoneNumber ? (
            <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rfid">RFID</Label>
          <Input id="rfid" {...register("rfid")} />
          {errors.rfid ? (
            <p className="text-xs text-red-600">{errors.rfid.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select id="department" {...register("department")}>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register("designation")} />
          {errors.designation ? (
            <p className="text-xs text-red-600">{errors.designation.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift">Shift</Label>
          <Select id="shift" {...register("shift")}>
            {SHIFTS.map((shift) => (
              <option key={shift} value={shift}>
                {SHIFT_LABELS[shift]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="mb-4 text-sm font-medium text-slate-900">
          Address (optional)
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Street</Label>
            <Input id="street" {...register("street")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
        </div>
      </div>

      <FormActions>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Creating..." : "Create employee"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/workforce")}
        >
          Cancel
        </Button>
      </FormActions>
    </form>
  );
}
