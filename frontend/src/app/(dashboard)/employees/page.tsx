"use client";

import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EmployeesContent } from "@/features/employees/components/employees-content";

export default function EmployeesPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="page" />}>
      <EmployeesContent />
    </Suspense>
  );
}
