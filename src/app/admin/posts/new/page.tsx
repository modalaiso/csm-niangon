import { PostCreateWizard } from "@/components/admin/post-create-wizard";

export const metadata = {
  title: "Créer un post | CSM Niangon",
};

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        Créer une publication
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Suivez les étapes pour créer et publier votre contenu.
      </p>
      <PostCreateWizard />
    </div>
  );
}