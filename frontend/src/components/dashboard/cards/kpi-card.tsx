import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/cn";

type KpiCardProps = {
  label: string;
  value: number;
  delta?: string;
  tone?: "default" | "success" | "warning";
};

const valueTone: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-slate-900",
  success: "text-primary",
  warning: "text-amber-600",
};

export function KpiCard({ label, value, delta, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", valueTone[tone])}>
        <AnimatedCounter value={value} duration={1.2} />
      </p>
      {delta ? (
        <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
      ) : null}
    </div>
  );
}
