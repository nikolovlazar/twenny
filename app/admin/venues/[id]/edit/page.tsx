import { PageHeader } from "@/components/admin/page-header";
import { VenueForm } from "../../venue-form";
import { getVenue } from "@/server/use-cases/admin/venues/get-venue";
import { notFound } from "next/navigation";

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenue(id);

  if (!venue) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Venue"
        breadcrumbs={[
          { label: "Venues", href: "/admin/venues" },
          { label: venue.name, href: `/admin/venues/${venue.id}` },
          { label: "Edit" },
        ]}
      />

      <VenueForm venue={venue} />
    </div>
  );
}

