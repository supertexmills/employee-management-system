"use client";

import { EmptyState } from "@/components/dashboard/page-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pagination as PaginationMeta } from "@/lib/api/types";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  /** Applied to the <TableHead> element only */
  headerClassName?: string;
  /** Applied to every <TableCell> in this column */
  className?: string;
  cell: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  /** Navigate or act on a row click. Adds cursor-pointer + keyboard activation. */
  onRowClick?: (row: T) => void;
  /** Accessible <caption> announced by screen readers */
  caption?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyTitle = "No records found",
  emptyDescription,
  pagination,
  onPageChange,
  onRowClick,
  caption,
}: DataTableProps<T>) {
  if (isLoading) {
    return <PageSkeleton variant="table" className="p-4" />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-4">
      <Table>
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.headerClassName ?? col.className}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && pagination.pages > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1) onPageChange(pagination.page - 1);
                }}
                aria-disabled={pagination.page <= 1}
                className={
                  pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.pages) {
                    onPageChange(pagination.page + 1);
                  }
                }}
                aria-disabled={pagination.page >= pagination.pages}
                className={
                  pagination.page >= pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
