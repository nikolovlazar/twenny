"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface PaginationProps {
  pagination: PaginationData;
  basePath: string;
  itemName: string;
}

export function Pagination({ pagination, basePath, itemName }: PaginationProps) {
  const { page, total, totalPages, hasNext, hasPrev } = pagination;

  const prevUrl = `${basePath}?page=${page - 1}`;
  const nextUrl = `${basePath}?page=${page + 1}`;

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page.toLocaleString()} of {totalPages.toLocaleString()} · {total.toLocaleString()} {itemName} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            asChild={hasPrev}
          >
            {hasPrev ? (
              <Link href={prevUrl}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            asChild={hasNext}
          >
            {hasNext ? (
              <Link href={nextUrl}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Quick jump:</span>
        {[5, 5000, 50000, 100000].map((pageNum) => (
          <Button
            key={pageNum}
            variant="secondary"
            size="sm"
            disabled={pageNum > totalPages}
            asChild={pageNum <= totalPages}
            className="text-xs h-7"
          >
            {pageNum <= totalPages ? (
              <Link href={`${basePath}?page=${pageNum}`}>
                Page {pageNum.toLocaleString()}
              </Link>
            ) : (
              <>Page {pageNum.toLocaleString()}</>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
