import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { listTicketsAdmin } from "@/server/use-cases/admin/tickets/list-tickets-admin";
import { TicketsTable } from "./tickets-table";

interface TicketsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { tickets, pagination } = await listTicketsAdmin(page);

  return (
    <div>
      <PageHeader
        title="Tickets"
        breadcrumbs={[{ label: "Tickets" }]}
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Mode:</span>
        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/15">
          🐌 Unoptimized
        </Badge>
      </div>

      <TicketsTable tickets={tickets} pagination={pagination} />
    </div>
  );
}
