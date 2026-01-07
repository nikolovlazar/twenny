import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { listTicketsAdmin } from "@/server/use-cases/admin/tickets/list-tickets-admin";
import { TicketsTable } from "./tickets-table";

interface TicketsPageProps {
  searchParams: Promise<{ cursor?: string; page?: string; prevCursor?: string; jumpTo?: string }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const isJump = params.jumpTo === "true";

  const { tickets, pagination } = await listTicketsAdmin(
    params.cursor,
    page,
    params.prevCursor,
    isJump
  );

  return (
    <div>
      <PageHeader
        title="Tickets"
        breadcrumbs={[{ label: "Tickets" }]}
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Mode:</span>
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">
          ⚡ Optimized
        </Badge>
      </div>

      <TicketsTable tickets={tickets} pagination={pagination} />
    </div>
  );
}
