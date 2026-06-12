import { cn } from "@/lib/cn";

type LiveIndicatorProps = {
  connected: boolean;
  className?: string;
};

export function LiveIndicator({ connected, className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        connected
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connected ? "animate-pulse bg-green-500" : "bg-amber-500",
        )}
        aria-hidden
      />
      {connected ? "Live" : "Polling"}
    </span>
  );
}
