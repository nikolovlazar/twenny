import { PageHeader } from "@/components/admin/page-header";
import { listVenues } from "@/server/use-cases/admin/venues/list-venues";
import { VenuesTable } from "./venues-table";

interface VenuesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { venues, pagination } = await listVenues(page);

  return (
    <div>
      <PageHeader
        title="Venues"
        breadcrumbs={[{ label: "Venues" }]}
        action={{ label: "Add Venue", href: "/admin/venues/new" }}
      />

      <VenuesTable venues={venues} pagination={pagination} />
    </div>
  );
}

