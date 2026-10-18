import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Utilisateurs | Dashboard - CSM Niangon",
};

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Utilisateurs"
        description="Recherchez les membres et attribuez les rôles adaptés. Votre propre rôle reste protégé."
      />
      <AdminUsersTable currentUserId={currentUser.id} />
    </div>
  );
}
