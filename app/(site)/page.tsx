import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { listEvents } from "@/server/use-cases/events/list-events";

export default async function HomePage() {
  // Fetch featured events (upcoming events, limited to 6)
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const result = await listEvents({
    dateFrom: new Date(),
    dateTo: oneWeekFromNow,
    limit: 6,
    page: 1,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            Discover Amazing Events
          </h1>
          <p className="mb-8 text-xl text-zinc-300">
            Find and book tickets to concerts, sports, theater, and more
          </p>
          <Link href="/events">
            <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
              Browse All Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-zinc-900">
              Featured Events This Week
            </h2>
            <Link href="/events">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {result.events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-zinc-600">
                No featured events available at the moment.
              </p>
              <Link href="/events">
                <Button className="mt-4">Browse All Events</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-900">
            Ready to Find Your Next Event?
          </h2>
          <p className="mb-8 text-lg text-zinc-600">
            Browse thousands of events and get your tickets today
          </p>
          <Link href="/events">
            <Button size="lg">Explore Events</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

