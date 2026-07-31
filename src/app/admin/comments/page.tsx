import { AdminCommentsTable } from "@/components/admin/admin-comments-table";

export const metadata = {
  title: "Commentaires | Dashboard admin",
};

export default function AdminCommentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Commentaires</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tous les commentaires de la plateforme, tous posts confondus.
        </p>
      </div>
      <AdminCommentsTable />
    </div>
  );
}