"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export type CursorPaginationData = {
  nextCursor: string | null;
  prevCursor: string | null;
  currentCursor: string | null;
  currentPage: number;
  hasMore: boolean;
  total: number;
  totalPages: number;
};

interface CursorPaginationProps {
  pagination: CursorPaginationData;
  basePath: string;
  itemName: string;
}

export function CursorPagination({ pagination, basePath, itemName }: CursorPaginationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { nextCursor, prevCursor, currentCursor, currentPage, hasMore, total, totalPages } = pagination;

  // Previous button: go back to page 1 (no cursor) or use prevCursor if available
  const hasPrevious = currentPage > 1;
  const prevUrl = prevCursor
    ? `${basePath}?cursor=${prevCursor}&page=${currentPage - 1}${currentCursor ? `&prevCursor=${currentCursor}` : ''}`
    : basePath; // Go to first page (no cursor)

  // Next button: use nextCursor and pass current cursor as prevCursor
  const nextUrl = nextCursor
    ? `${basePath}?cursor=${nextCursor}&page=${currentPage + 1}${currentCursor ? `&prevCursor=${currentCursor}` : ''}`
    : '';

  const handlePageJump = (targetPage: number) => {
    startTransition(() => {
      router.push(`${basePath}?page=${targetPage}&jumpTo=true`);
    });
  };

  const quickJumpPages = [5, 5000, 50000, 100000];

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()} · {total.toLocaleString()} {itemName} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            asChild={hasPrevious}
            id="pagination-prev-btn"
          >
            {hasPrevious ? (
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
            disabled={!hasMore}
            asChild={hasMore}
            id="pagination-next-btn"
          >
            {hasMore && nextCursor ? (
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
        {quickJumpPages.map((pageNum) => (
          <Button
            key={pageNum}
            variant="secondary"
            size="sm"
            disabled={isPending || pageNum > totalPages}
            onClick={() => handlePageJump(pageNum)}
            className="text-xs h-7"
          >
            Page {pageNum.toLocaleString()}
          </Button>
        ))}
      </div>
    </div>
  );
}

