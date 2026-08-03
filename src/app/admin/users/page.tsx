import { requireAdmin } from "@/lib/auth/admin-guard";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export const metadata = {
  title: "Utilisateurs | Dashboard admin",
};

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les rôles de la plateforme. Vous ne pouvez pas modifier votre propre rôle.
        </p>
      </div>
      <AdminUsersTable currentUserId={currentUser.id} />
    </div>
  );
}