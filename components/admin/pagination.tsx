"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { page, total, totalPages, hasNext, hasPrev } = pagination;

  const handlePageJump = (targetPage: number) => {
    startTransition(() => {
      router.push(`${basePath}?page=${targetPage}`);
    });
  };

  const quickJumpPages = [5, 5000, 50000, 100000];

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
            id="pagination-prev-btn"
          >
            {hasPrev ? (
              <Link href={`${basePath}?page=${page - 1}`}>
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
            id="pagination-next-btn"
          >
            {hasNext ? (
              <Link href={`${basePath}?page=${page + 1}`}>
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

