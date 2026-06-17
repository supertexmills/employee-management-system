"use client";

import { formatDateTime } from "@/lib/format";
import type { ProductionRoundEvent } from "@/types/production";
import { motion, useReducedMotion } from "framer-motion";

type RoundActivityFeedProps = {
  rounds: ProductionRoundEvent[];
  title?: string;
  description?: string;
  emptyMessage?: string;
};

export function RoundActivityFeed({
  rounds,
  title = "Live round activity",
  description = "Each accepted pass at the machine reader counts as one round.",
  emptyMessage = "Round events will appear here when employees pass the reader.",
}: RoundActivityFeedProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {rounds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">No rounds yet</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rounds.map((round) => (
            <motion.li
              key={round.roundKey}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {round.employee?.employeeName ?? "Unknown"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {round.machineName ?? round.machineId} · hour {round.shiftHourLabel}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  +1 round
                  {round.totalRoundsShift != null
                    ? ` · ${round.totalRoundsShift} shift`
                    : ""}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDateTime(round.detectedAt)}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
