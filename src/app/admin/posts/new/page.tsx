import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostCreateWizard } from "@/components/admin/post-create-wizard";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Créer un post | Dashboard - CSM Niangon",
};

export default async function NewPostPage() {
  await requirePostManager();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Créer une publication"
        description="Préparez votre contenu étape par étape, puis choisissez de le publier ou de le garder en brouillon."
      />
      <PostCreateWizard />
    </div>
  );
}
