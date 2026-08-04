import { requireDashboardAccess } from "@/lib/auth/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const metadata = {
  title: "Dashboard | CSM Niangon",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireDashboardAccess();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <AdminSidebar role={user.role} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}