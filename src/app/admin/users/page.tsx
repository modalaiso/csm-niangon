import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Utilisateurs | Dashboard - CSM Niangon",
};

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const schoolClasses = await prisma.schoolClass.findMany({
    orderBy: [{ level: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Utilisateurs"
        description="Recherchez les membres et attribuez les rôles adaptés. Votre propre rôle reste protégé."
      />
      <AdminUsersTable
        currentUserId={currentUser.id}
        schoolClasses={schoolClasses}
      />
    </div>
  );
}
