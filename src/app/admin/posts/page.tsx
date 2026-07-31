import Link from "next/link";
import { Ghost, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPostsTable } from "@/components/admin/admin-posts-table";

export const metadata = {
  title: "Publications | Dashboard admin",
};

export default function AdminPostsPage() {
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
          <Button size="sm" className="gap-1.5 text-white rounded-full">
            <PenSquare className="h-4 w-4" />
            Nouveau post
          </Button>
        </Link>
      </div>
      <AdminPostsTable />
    </div>
  );
}