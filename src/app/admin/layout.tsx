import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { requireDashboardAccess } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Dashboard | CSM Niangon",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireDashboardAccess();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20 md:flex-row">
      <AdminSidebar user={user} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/20 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
