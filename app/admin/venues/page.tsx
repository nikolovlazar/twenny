import { PageHeader } from "@/components/admin/page-header";
import { listVenues } from "@/server/use-cases/admin/venues/list-venues";
import { VenuesTable } from "./venues-table";

export default async function VenuesPage() {
  const venues = await listVenues();

  return (
    <div>
      <PageHeader
        title="Venues"
        breadcrumbs={[{ label: "Venues" }]}
        action={{ label: "Add Venue", href: "/admin/venues/new" }}
      />

      <VenuesTable venues={venues} />
    </div>
  );
}

