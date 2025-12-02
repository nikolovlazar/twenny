"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface EventsPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function EventsPagination({
  currentPage,
  totalPages,
  searchParams,
}: EventsPaginationProps) {
  const router = useRouter();
  const [jumpToPage, setJumpToPage] = useState("");

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({ ...searchParams, page: page.toString() }).filter(
            ([, v]) => v != null
          )
        )
      );
      return `/events?${params.toString()}`;
    },
    [searchParams]
  );

  const handleJumpToPage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const pageNum = parseInt(jumpToPage, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        router.push(buildUrl(pageNum));
        setJumpToPage("");
      }
    },
    [jumpToPage, totalPages, buildUrl, router]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <Link href={buildUrl(currentPage - 1)}>
            <Button variant="outline">Previous</Button>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Link key={pageNum} href={buildUrl(pageNum)}>
                <Button
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              </Link>
            );
          })}
        </div>

        {currentPage < totalPages && (
          <Link href={buildUrl(currentPage + 1)}>
            <Button variant="outline">Next</Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">Go to page</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          placeholder={String(currentPage)}
          className="w-16 h-8 text-center"
        />
        <span className="text-sm text-zinc-600">of {totalPages}</span>
      </form>
    </div>
  );
}

