import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<AttendanceStatus | string, string> = {
  PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INSIDE: "bg-blue-50 text-blue-700 border-blue-200",
  EXITED: "bg-slate-50 text-slate-700 border-slate-200",
  ABSENT: "bg-red-50 text-red-700 border-red-200",
  LATE: "bg-amber-50 text-amber-700 border-amber-200",
  OVERTIME: "bg-purple-50 text-purple-700 border-purple-200",
  MISSING_TAG: "bg-orange-50 text-orange-700 border-orange-200",
  UNAUTHORIZED: "bg-rose-50 text-rose-700 border-rose-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  ENTRY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXIT: "bg-blue-50 text-blue-700 border-blue-200",
  UNKNOWN: "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border font-medium capitalize",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </Badge>
  );
}
