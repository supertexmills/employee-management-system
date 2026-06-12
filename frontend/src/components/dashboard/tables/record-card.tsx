import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type RecordCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function RecordCard({ children, className, onClick }: RecordCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm shadow-slate-900/5 transition-colors",
        onClick && "hover:bg-surface-alt",
        className,
      )}
    >
      {children}
    </Component>
  );
}

type RecordCardRowProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function RecordCardRow({ label, children, className }: RecordCardRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-t border-border/60 py-2.5 first:border-t-0 first:pt-0 last:pb-0",
        className,
      )}
    >
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 text-right text-sm text-slate-700">{children}</div>
    </div>
  );
}

type RecordCardHeaderProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function RecordCardHeader({ title, subtitle, trailing }: RecordCardHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
