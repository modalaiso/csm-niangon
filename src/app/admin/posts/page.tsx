import { FileText, PenSquare } from "lucide-react";
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
        icon={FileText}
        action={
          <Link href="/admin/posts/new">
            <Button className="h-10 gap-2 rounded-xl px-4 text-white shadow-sm">
              <PenSquare className="h-4 w-4" />
              Nouvelle publication
            </Button>
          </Link>
        }
      />
      <AdminPostsTable />
    </div>
  );
}
