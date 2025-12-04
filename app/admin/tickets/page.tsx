import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { getOptimizationState } from "@/server/lib/get-optimization-state";
import { listTicketsAdmin } from "@/server/use-cases/admin/tickets/list-tickets-admin";
import { TicketsTable } from "./tickets-table";

interface TicketsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { tickets, pagination } = await listTicketsAdmin(page);

  const state = await getOptimizationState();

  return (
    <div>
      <PageHeader
        title="Tickets"
        breadcrumbs={[{ label: "Tickets" }]}
      />

      {state && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mode:</span>
          <Badge
            variant={state.optimized ? "default" : "secondary"}
            className={
              state.optimized
                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15"
                : "bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/15"
            }
          >
            {state.optimized ? "⚡ Optimized" : "🐌 Unoptimized"}
          </Badge>
        </div>
      )}

      <TicketsTable tickets={tickets} pagination={pagination} />
    </div>
  );
}
