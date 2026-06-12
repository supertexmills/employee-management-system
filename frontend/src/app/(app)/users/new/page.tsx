"use client";

import { CreateUserForm } from "@/components/auth/create-user-form";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateUserPage() {
  const router = useRouter();
  const { canCreateUser } = useAuth();

  useEffect(() => {
    if (!canCreateUser()) {
      router.replace("/users");
    }
  }, [canCreateUser, router]);

  if (!canCreateUser()) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Create Portal User"
        description="Provision a new login account with the appropriate role."
        breadcrumbs={[
          { label: "Dashboard", href: "/overview" },
          { label: "Portal Users", href: "/users" },
          { label: "New" },
        ]}
      />
      <CreateUserForm />
    </div>
  );
}
