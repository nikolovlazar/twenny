import { requireAdmin } from "@/server/services/admin-guard";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)] p-6">
          <AdminNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

