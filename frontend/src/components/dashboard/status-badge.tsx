import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  active:
    "bg-status-success-bg text-status-success-text border-status-success-border",
  inactive:
    "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border",
  pending:
    "bg-status-warning-bg text-status-warning-text border-status-warning-border",
  suspended:
    "bg-status-error-bg text-status-error-text border-status-error-border",
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
