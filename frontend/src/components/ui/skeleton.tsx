import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-surface-alt", className)}
      {...props}
    />
  );
}
