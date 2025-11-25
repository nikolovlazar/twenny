"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Concert",
  "Sports",
  "Theater",
  "Comedy",
  "Conference",
  "Festival",
  "Exhibition",
  "Workshop",
];

const DATE_FILTERS = [
  { label: "All Dates", value: "" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Upcoming", value: "upcoming" },
];

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (category && category !== "All Categories") params.set("category", category);
    if (dateFilter) params.set("date", dateFilter);

    // Use setTimeout to debounce search input
    const timeoutId = setTimeout(() => {
      router.push(`/events?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category, dateFilter, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category && category !== "All Categories") params.set("category", category);
    if (dateFilter) params.set("date", dateFilter);
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">Category:</span>
          <select
            value={category || "All Categories"}
            onChange={(e) => setCategory(e.target.value === "All Categories" ? "" : e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">Date:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            {DATE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

