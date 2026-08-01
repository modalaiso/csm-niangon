import { requireDashboardAccess } from "@/lib/auth/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const metadata = {
  title: "Dashboard admin | CSM Niangon",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireDashboardAccess();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar role={user.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}