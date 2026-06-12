import { cn } from "@/lib/cn";

type StatusTone = "success" | "warning" | "error" | "neutral" | "info";

const toneStyles: Record<StatusTone, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-primary",
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function userStatusTone(
  status: string,
): StatusTone {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "error";
    default:
      return "neutral";
  }
}
