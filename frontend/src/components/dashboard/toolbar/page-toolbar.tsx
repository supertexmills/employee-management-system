import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type PageToolbarProps = {
  children: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function PageToolbar({ children, meta, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
        {children}
      </div>
      {meta ? (
        <p className="shrink-0 text-sm text-muted-foreground">{meta}</p>
      ) : null}
    </div>
  );
}

type PageToolbarFiltersProps = {
  children: ReactNode;
  className?: string;
};

export function PageToolbarFilters({ children, className }: PageToolbarFiltersProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
