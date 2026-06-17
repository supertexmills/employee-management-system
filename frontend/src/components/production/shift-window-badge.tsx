import type { ShiftWindow } from "@/types/production";
import { SHIFT_LABELS, type Shift } from "@/lib/constants/departments";
import { cn } from "@/lib/cn";

type ShiftWindowBadgeProps = {
  shift?: string | null;
  shiftWindow?: ShiftWindow | null;
  className?: string;
};

export function ShiftWindowBadge({
  shift,
  shiftWindow,
  className,
}: ShiftWindowBadgeProps) {
  if (!shift && !shiftWindow) return null;

  const shiftLabel =
    shift && shift in SHIFT_LABELS
      ? SHIFT_LABELS[shift as Shift]
      : shift ?? "Shift";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm",
        className,
      )}
    >
      <span className="text-primary">{shiftLabel}</span>
      {shiftWindow ? (
        <span className="text-muted-foreground">
          {shiftWindow.start} – {shiftWindow.end}
        </span>
      ) : null}
    </div>
  );
}
