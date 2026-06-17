import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/cn";
import type {
  ProductionLiveSnapshot,
  ProductionTodaySummary,
} from "@/types/production";
import { Factory, Radio, RotateCcw, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProductionKpiGridProps = {
  liveSnapshot?: ProductionLiveSnapshot | null;
  todaySummary?: ProductionTodaySummary | null;
};

type KpiItem = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  variant: "hero" | "default";
};

export function ProductionKpiGrid({
  liveSnapshot,
  todaySummary,
}: ProductionKpiGridProps) {
  const roundsThisHour =
    liveSnapshot?.totals.roundsThisHour ?? todaySummary?.hourlyTotals?.at(-1)?.rounds ?? 0;
  const shiftTotal =
    liveSnapshot?.totals.roundsTodayShift ?? todaySummary?.totalRounds ?? 0;
  const activeEmployees =
    todaySummary?.activeEmployees ??
    liveSnapshot?.machines.reduce((sum, m) => sum + m.activeEmployees, 0) ??
    0;
  const machinesOnline =
    liveSnapshot?.machines.filter((m) => m.readerConnected).length ?? 0;

  const items: KpiItem[] = [
    {
      label: "Rounds this hour",
      value: roundsThisHour,
      hint: "Live production pace",
      icon: Radio,
      variant: "hero",
    },
    {
      label: "Shift total",
      value: shiftTotal,
      hint: "Rounds today in shift",
      icon: RotateCcw,
      variant: "default",
    },
    {
      label: "Active employees",
      value: activeEmployees,
      hint: "Workers with rounds",
      icon: Users,
      variant: "default",
    },
    {
      label: "Machines online",
      value: machinesOnline,
      hint: "Readers connected",
      icon: Factory,
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
              <AnimatedCounter value={item.value} duration={0.3} />
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
