import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPostsTable } from "@/components/admin/admin-posts-table";
import { Button } from "@/components/ui/button";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Publications | Dashboard - CSM Niangon",
};

export default async function AdminPostsPage() {
  await requirePostManager();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Publications"
        description="Pilotez vos contenus, leur statut de diffusion et leurs performances."
        action={
          <Button
            asChild
            className="h-10 gap-2 rounded-md bg-primarys2-700 px-4 text-white hover:bg-primarys2-800"
          >
            <Link href="/admin/posts/new">Nouvelle publication</Link>
          </Button>
        }
      />
      <AdminPostsTable />
    </div>
  );
}
