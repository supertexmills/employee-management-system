import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
