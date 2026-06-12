"use client";

import { CreateEmployeeForm } from "@/components/auth/create-employee-form";
import { PageHeader } from "@/components/dashboard/shell/page-header";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { canManageEmployee } = useAuth();

  useEffect(() => {
    if (!canManageEmployee("create")) {
      router.replace("/workforce");
    }
  }, [canManageEmployee, router]);

  if (!canManageEmployee("create")) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Add Employee"
        description="Create a new workforce record for attendance and shift tracking."
        breadcrumbs={[
          { label: "Dashboard", href: "/overview" },
          { label: "Workforce", href: "/workforce" },
          { label: "New" },
        ]}
      />
      <CreateEmployeeForm />
    </div>
  );
}
