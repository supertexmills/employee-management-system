import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement>;

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass-card rounded-2xl", className)}
      {...props}
    />
  );
}
