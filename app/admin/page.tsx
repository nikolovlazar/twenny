import { PageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import {
  Calendar,
  ShoppingCart,
  Users,
  CreditCard,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { getDashboardStats } from "@/server/use-cases/admin/stats/get-dashboard-stats";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString()}
          icon={Calendar}
          description={`${stats.publishedEvents} published`}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title="Total Tickets"
          value={stats.totalTickets.toLocaleString()}
          icon={CreditCard}
          description={`${stats.checkedInTickets} checked in`}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${parseFloat(stats.totalRevenue).toLocaleString()}`}
          icon={DollarSign}
          description="From completed orders"
        />
        <StatsCard
          title="Checked In"
          value={stats.checkedInTickets.toLocaleString()}
          icon={CheckCircle2}
          description="Tickets used"
        />
      </div>
    </div>
  );
}

