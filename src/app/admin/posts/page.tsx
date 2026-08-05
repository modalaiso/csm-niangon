import Link from "next/link";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPostsTable } from "@/components/admin/admin-posts-table";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Publications | Dashboard | CSM Niangon",
};

export default async function AdminPostsPage() {
  await requirePostManager();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez toutes les publications : statut, suppression, vues et réactions.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="sm" className="rounded-full gap-1.5 text-white">
            <PenSquare className="h-4 w-4" />
            Nouveau post
          </Button>
        </Link>
      </div>
      <AdminPostsTable />
    </div>
  );
}