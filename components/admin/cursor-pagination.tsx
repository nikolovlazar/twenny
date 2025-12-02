"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
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
  const [pageInput, setPageInput] = useState(String(pagination.currentPage));
  const { nextCursor, prevCursor, currentCursor, currentPage, hasMore, total, totalPages } = pagination;

  // Update input value when page changes via Next/Previous
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Previous button: go back to page 1 (no cursor) or use prevCursor if available
  const hasPrevious = currentPage > 1;
  const prevUrl = prevCursor
    ? `${basePath}?cursor=${prevCursor}&page=${currentPage - 1}${currentCursor ? `&prevCursor=${currentCursor}` : ''}`
    : basePath; // Go to first page (no cursor)

  // Next button: use nextCursor and pass current cursor as prevCursor
  const nextUrl = nextCursor
    ? `${basePath}?cursor=${nextCursor}&page=${currentPage + 1}${currentCursor ? `&prevCursor=${currentCursor}` : ''}`
    : '';

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPage = parseInt(pageInput, 10);
    if (targetPage >= 1 && targetPage <= totalPages) {
      // For arbitrary page jumps, fall back to offset-based navigation
      // This intentionally shows performance degradation for demo purposes
      startTransition(() => {
        router.push(`${basePath}?page=${targetPage}&jumpTo=true`);
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()} · {total.toLocaleString()} {itemName} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          asChild={hasPrevious}
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

        <form onSubmit={handlePageJump} className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-28 h-8 text-sm"
            disabled={isPending}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending || !pageInput}
          >
            Go
          </Button>
        </form>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasMore}
          asChild={hasMore}
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
  );
}

