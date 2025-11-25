import Link from "next/link";
import Image from "next/image";
import { Card } from "./ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  thumbnailImageUrl: string | null;
  startDate: Date;
  venueName: string;
  venueCity: string | null;
  minPrice: string | null;
  category: string | null;
}

export function EventCard({
  slug,
  title,
  shortDescription,
  thumbnailImageUrl,
  startDate,
  venueName,
  venueCity,
  minPrice,
  category,
}: EventCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startDate));

  return (
    <Link href={`/events/${slug}`}>
      <Card className="group overflow-hidden p-0 transition-all hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          {thumbnailImageUrl ? (
            <Image
              src={thumbnailImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
              <span className="text-4xl">🎟️</span>
            </div>
          )}
          {category && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-900">
                {category}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-zinc-900">
            {title}
          </h3>
          {shortDescription && (
            <p className="mb-3 line-clamp-2 text-sm text-zinc-600">
              {shortDescription}
            </p>
          )}
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-600">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
            <MapPinIcon className="h-4 w-4" />
            <span>
              {venueName}
              {venueCity && `, ${venueCity}`}
            </span>
          </div>
          {minPrice && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-zinc-600">From</span>
              <span className="text-lg font-semibold text-zinc-900">
                ${parseFloat(minPrice).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

