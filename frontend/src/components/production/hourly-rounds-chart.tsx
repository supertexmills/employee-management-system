"use client";

import { cn } from "@/lib/cn";
import type { HourlyTotal } from "@/types/production";
import { motion, useReducedMotion } from "framer-motion";

type HourlyRoundsChartProps = {
  data: HourlyTotal[];
  className?: string;
};

export function HourlyRoundsChart({ data, className }: HourlyRoundsChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const maxRounds = Math.max(...data.map((d) => d.rounds), 1);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Hourly rounds
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Production volume by hour within the current shift.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">No round data yet today.</p>
        </div>
      ) : (
        <div className="flex items-end gap-2 overflow-x-auto pb-2">
          {data.map((slot, index) => {
            const heightPct = Math.max(8, (slot.rounds / maxRounds) * 100);
            return (
              <div
                key={`${slot.hourLabel}-${index}`}
                className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-medium tabular-nums text-slate-700">
                  {slot.rounds}
                </span>
                <motion.div
                  className="w-full max-w-10 rounded-t-md bg-primary/80"
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : index * 0.04,
                  }}
                  style={{ minHeight: "0.5rem", maxHeight: "8rem" }}
                />
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {slot.hourLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
