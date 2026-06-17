import type { TopPerformer } from "@/types/production";

type PerformerLeaderboardProps = {
  performers: TopPerformer[];
};

export function PerformerLeaderboard({ performers }: PerformerLeaderboardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Top performers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Highest round counts in the selected shift.
        </p>
      </div>

      {performers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">No performers yet today.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {performers.map((performer, index) => (
            <li
              key={`${performer.employeeName}-${performer.machineId}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-surface px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {performer.employeeName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {performer.machineId}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {performer.totalRounds}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
