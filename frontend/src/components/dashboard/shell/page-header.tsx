import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  breadcrumbs,
  action,
  className,
}: PageHeaderProps) {
  const items: BreadcrumbItem[] | undefined =
    breadcrumbs ??
    (breadcrumb
      ? breadcrumb.split(" / ").map((label) => ({ label: label.trim() }))
      : undefined);

  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div>
        {items && items.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-slate-900"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(isLast && "text-slate-700")}
                        aria-current={isLast ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="w-full shrink-0 md:w-auto [&_a]:w-full [&_button]:w-full md:[&_a]:w-auto md:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
