import { cn } from "@/lib/cn";

type LiveIndicatorProps = {
  connected: boolean;
  reconnecting?: boolean;
  readerConnected?: boolean;
  className?: string;
};

export function LiveIndicator({
  connected,
  reconnecting = false,
  readerConnected,
  className,
}: LiveIndicatorProps) {
  const label = reconnecting
    ? "Reconnecting"
    : connected
      ? "Live"
      : "Offline";

  const tone = reconnecting
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : connected
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  const dotTone = reconnecting
    ? "animate-pulse bg-amber-500"
    : connected
      ? "animate-pulse bg-green-500"
      : "bg-slate-400";

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
          tone,
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", dotTone)} aria-hidden />
        {label}
      </span>
      {readerConnected === false ? (
        <span className="text-[11px] text-amber-700">Reader disconnected</span>
      ) : null}
    </div>
  );
}
