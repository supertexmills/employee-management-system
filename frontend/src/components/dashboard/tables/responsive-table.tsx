import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type ResponsiveTableProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderMobileCard: (item: T) => ReactNode;
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  breakpoint?: "md" | "lg";
};

const breakpointClasses = {
  md: {
    table: "hidden md:block",
    cards: "space-y-3 md:hidden",
  },
  lg: {
    table: "hidden lg:block",
    cards: "space-y-3 lg:hidden",
  },
} as const;

export function ResponsiveTable<T>({
  data,
  keyExtractor,
  renderMobileCard,
  children,
  className,
  mobileClassName,
  breakpoint = "md",
}: ResponsiveTableProps<T>) {
  const classes = breakpointClasses[breakpoint];

  return (
    <div className={className}>
      <div className={classes.table}>{children}</div>
      <div className={cn(classes.cards, mobileClassName)}>
        {data.map((item) => (
          <div key={keyExtractor(item)}>{renderMobileCard(item)}</div>
        ))}
      </div>
    </div>
  );
}
