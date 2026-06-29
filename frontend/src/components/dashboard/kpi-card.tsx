"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
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
    </motion.div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}
