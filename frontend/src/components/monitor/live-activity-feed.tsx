import { StatusBadge } from "@/components/dashboard/tables/status-badge";
import { formatDateTime } from "@/lib/format";
import type { RfidEvent } from "@/types/attendance";

type LiveActivityFeedProps = {
  events: RfidEvent[];
  title?: string;
  description?: string;
  emptyMessage?: string;
};

export function LiveActivityFeed({
  events,
  title = "Live gate activity",
  description = "Latest RFID reads as employees pass the main gate.",
  emptyMessage = "Tag reads will appear here when RFID is enabled.",
}: LiveActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">No activity yet</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {events.map((event) => (
            <li
              key={event._id}
              className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {event.employeeName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {event.location}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
                <StatusBadge
                  label={event.action}
                  tone={event.action === "ENTRY" ? "success" : "info"}
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDateTime(event.detectedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
