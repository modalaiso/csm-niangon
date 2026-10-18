import { FilePenLine } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getPostForEdit } from "@/app/actions/admin-posts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostCreateWizard } from "@/components/admin/post-create-wizard";

export const metadata = {
  title: "Modifier une publication | Dashboard - CSM Niangon",
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({
  params,
}: Readonly<EditPostPageProps>) {
  const { id } = await params;
  const result = await getPostForEdit(id);

  if ("error" in result) {
    if (result.error === "auth_required") redirect("/login");
    if (result.error === "not_found") notFound();
    // "forbidden" ne devrait pas arriver ici (déjà filtré par le layout /admin)
    redirect("/admin/posts");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Modifier la publication"
        description="Les champs sont préremplis avec le contenu actuel. Enregistrez vos changements ou publiez la version mise à jour."
        icon={FilePenLine}
      />
      <PostCreateWizard mode="edit" initial={result.post} />
    </div>
  );
}
