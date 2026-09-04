import { notFound, redirect } from "next/navigation";
import { getPostForEdit } from "@/app/actions/admin-posts";
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
    <div>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        Modifier la publication
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Les champs sont préremplis avec le contenu actuel.
      </p>
      <PostCreateWizard mode="edit" initial={result.post} />
    </div>
  );
}
