"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
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
  const { page, total, totalPages, hasNext, hasPrev, pageSize } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const [jumpToPage, setJumpToPage] = useState("");

  const handleJumpToPage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const pageNum = parseInt(jumpToPage, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        router.push(`${basePath}?page=${pageNum}`);
        setJumpToPage("");
      }
    },
    [jumpToPage, totalPages, basePath, router]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total.toLocaleString()} {itemName}
      </p>
      <div className="flex items-center gap-4">
        <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Go to page</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            placeholder={String(page)}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm text-muted-foreground">of {totalPages}</span>
        </form>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            asChild={hasPrev}
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
    </div>
  );
}

