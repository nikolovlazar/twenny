import { PageHeader } from "@/components/admin/page-header";
import { VenueForm } from "../venue-form";

export default function NewVenuePage() {
  return (
    <div>
      <PageHeader
        title="Create Venue"
        breadcrumbs={[
          { label: "Venues", href: "/admin/venues" },
          { label: "New" },
        ]}
      />

      <VenueForm />
    </div>
  );
}

