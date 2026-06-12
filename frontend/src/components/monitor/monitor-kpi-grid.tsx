import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/cn";
import type { LiveSummary } from "@/types/attendance";
import { Building2, Radio, UserCheck, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MonitorKpiGridProps = {
  summary: LiveSummary | null | undefined;
};

type KpiItem = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  variant: "hero" | "default";
};

export function MonitorKpiGrid({ summary }: MonitorKpiGridProps) {
  const items: KpiItem[] = [
    {
      label: "Live on floor",
      value: summary?.insideNow ?? 0,
      hint: "Currently inside",
      icon: Radio,
      variant: "hero",
    },
    {
      label: "Total employees",
      value: summary?.totalActive ?? 0,
      hint: "Active workforce",
      icon: Building2,
      variant: "default",
    },
    {
      label: "Present today",
      value: summary?.presentToday ?? 0,
      hint: "Entered today",
      icon: UserCheck,
      variant: "default",
    },
    {
      label: "Absent today",
      value: summary?.absentToday ?? 0,
      hint: "No entry recorded",
      icon: UserX,
      variant: "default",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isHero = item.variant === "hero";

        return (
          <div
            key={item.label}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 shadow-sm sm:p-6",
              isHero
                ? "border border-primary/20 bg-primary text-white shadow-primary/10"
                : "border border-slate-100 bg-white shadow-slate-900/5",
            )}
          >
            <div className="flex items-start justify-between">
              <p
                className={cn(
                  "text-sm font-medium",
                  isHero ? "text-blue-100" : "text-muted-foreground",
                )}
              >
                {item.label}
              </p>
              <Icon
                className={cn(
                  "h-5 w-5",
                  isHero ? "text-blue-200" : "text-slate-400",
                )}
                aria-hidden
              />
            </div>
            <p
              className={cn(
                "mt-3 text-3xl font-semibold tracking-tight",
                isHero ? "text-white" : "text-slate-900",
              )}
            >
              <AnimatedCounter value={item.value} duration={1} />
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                isHero ? "text-blue-100/90" : "text-muted-foreground",
              )}
            >
              {item.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
