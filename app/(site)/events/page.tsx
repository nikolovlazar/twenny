import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import { EventsPagination } from "@/components/events-pagination";
import { listEvents } from "@/server/use-cases/events/list-events";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchParams {
  search?: string;
  category?: string;
  date?: string;
  page?: string;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 12;

  // Parse date filter
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;
  const now = new Date();

  if (params.date === "week") {
    dateFrom = now;
    dateTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (params.date === "month") {
    dateFrom = now;
    dateTo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (params.date === "upcoming") {
    dateFrom = now;
  }

  const result = await listEvents({
    search: params.search,
    category: params.category,
    dateFrom,
    dateTo,
    page,
    limit,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-zinc-900">Browse Events</h1>

      <div className="mb-8">
        <EventFilters />
      </div>

      {result.events.length > 0 ? (
        <>
          <div className="mb-8">
            <p className="text-sm text-zinc-600">
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, result.totalCount)} of {result.totalCount} events
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                slug={event.slug}
                title={event.title}
                shortDescription={event.shortDescription}
                thumbnailImageUrl={event.thumbnailImageUrl}
                startDate={event.startDate}
                venueName={event.venueName}
                venueCity={event.venueCity}
                minPrice={event.minPrice}
                category={event.category}
              />
            ))}
          </div>

          {/* Pagination */}
          <EventsPagination
            currentPage={page}
            totalPages={result.totalPages}
            searchParams={params}
          />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg text-zinc-600">
            No events found matching your criteria.
          </p>
          <Link href="/events">
            <Button>Clear Filters</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

