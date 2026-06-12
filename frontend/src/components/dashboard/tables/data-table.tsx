import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/5",
        className,
      )}
    >
      <div className="relative overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent md:hidden"
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}

type DataTableHeaderProps = {
  children: ReactNode;
};

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {children}
      </tr>
    </thead>
  );
}

type DataTableHeadProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableHead({ children, className }: DataTableHeadProps) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-3 font-medium", className)}>
      {children}
    </th>
  );
}

type DataTableBodyProps = {
  children: ReactNode;
};

export function DataTableBody({ children }: DataTableBodyProps) {
  return <tbody>{children}</tbody>;
}

type DataTableRowProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableRow({ children, className }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "group border-b border-border last:border-0 hover:bg-surface-alt",
        className,
      )}
    >
      {children}
    </tr>
  );
}

type DataTableCellProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableCell({ children, className }: DataTableCellProps) {
  return <td className={cn("px-4 py-3 text-sm text-slate-700", className)}>{children}</td>;
}
