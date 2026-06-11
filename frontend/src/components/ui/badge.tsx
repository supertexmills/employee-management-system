import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
