import { formatDateTime } from "@/lib/format";
import type { MachineLiveStat } from "@/types/production";
import { cn } from "@/lib/cn";

type MachineStatusStripProps = {
  machines: MachineLiveStat[];
};

export function MachineStatusStrip({ machines }: MachineStatusStripProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Machine status
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reader connectivity and live round pace per machine.
        </p>
      </div>

      {machines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">No machines configured.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {machines.map((machine) => (
            <li
              key={machine.machineId}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    machine.readerConnected ? "bg-emerald-500" : "bg-slate-300",
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {machine.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {machine.machineId}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:justify-end">
                <span className="tabular-nums">
                  {machine.roundsThisHour} this hour
                </span>
                <span className="tabular-nums">
                  {machine.totalRoundsShift} shift
                </span>
                <span className="tabular-nums">
                  {machine.lastRoundAt
                    ? formatDateTime(machine.lastRoundAt)
                    : "No rounds"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
