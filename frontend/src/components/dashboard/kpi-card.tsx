"use client";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlighted?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  subtitle,
  highlighted,
  icon,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 shadow-sm",
        "animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
        "transition-[transform,box-shadow] duration-150",
        "motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        highlighted
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-card-foreground"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-xs",
                highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              highlighted ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}
