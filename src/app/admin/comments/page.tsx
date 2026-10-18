import { MessageCircle } from "lucide-react";
import { AdminCommentsTable } from "@/components/admin/admin-comments-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireModerator } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Commentaires | Dashboard - CSM Niangon",
};

export default async function AdminCommentsPage() {
  await requireModerator();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Commentaires"
        description="Consultez et gérez les commentaires de toute la plateforme, avec leurs réactions et leur statut de visibilité."
        icon={MessageCircle}
      />
      <AdminCommentsTable />
    </div>
  );
}
