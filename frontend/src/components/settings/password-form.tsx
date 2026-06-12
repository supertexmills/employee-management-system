"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const { logout } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.changePassword(values);
      reset();
      toast.success("Password updated. Please sign in again.");
      await logout();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Password update failed");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-xs font-medium text-primary"
            onClick={() => setShowCurrent((value) => !value)}
          >
            {showCurrent ? "Hide" : "Show"}
          </button>
        </div>
        {errors.currentPassword ? (
          <p className="text-xs text-red-600">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            {...register("newPassword")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-xs font-medium text-primary"
            onClick={() => setShowNew((value) => !value)}
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>
        {errors.newPassword ? (
          <p className="text-xs text-red-600">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-xs font-medium text-primary"
            onClick={() => setShowConfirm((value) => !value)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Updating your password signs you out on all devices for security.
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
