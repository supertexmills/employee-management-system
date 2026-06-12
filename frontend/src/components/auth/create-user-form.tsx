"use client";

import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  REGISTERABLE_ROLES,
  type RegisterableRole,
} from "@/lib/constants/roles";
import { useAuth } from "@/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(REGISTERABLE_ROLES),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

export function CreateUserForm() {
  const router = useRouter();
  const { creatableRoles } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: creatableRoles[0],
    },
  });

  const selectedRole = watch("role") as RegisterableRole | undefined;

  const onSubmit = handleSubmit(async (values) => {
    if (!creatableRoles.includes(values.role as RegisterableRole)) {
      toast.error("You cannot create this role");
      return;
    }

    try {
      await authApi.register(values);
      toast.success("User created successfully");
      router.push("/users");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create user");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm shadow-slate-900/5"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register("username")} />
        {errors.username ? (
          <p className="text-xs text-red-600">{errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password ? (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" {...register("role")}>
          {creatableRoles.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        {selectedRole && ROLE_DESCRIPTIONS[selectedRole] ? (
          <p className="text-xs text-muted-foreground">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>
        ) : null}
        {errors.role ? (
          <p className="text-xs text-red-600">{errors.role.message}</p>
        ) : null}
      </div>

      <FormActions>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Creating..." : "Create user"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/users")}
        >
          Cancel
        </Button>
      </FormActions>
    </form>
  );
}
