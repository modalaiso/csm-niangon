import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PostCreateWizard } from "@/components/admin/post-create-wizard";

export const metadata = {
  title: "Créer un post | CSM Niangon",
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || (dbUser.role !== "WRITER" && dbUser.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div>
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
          Créer une publication
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Suivez les étapes pour créer et publier votre contenu.
        </p>
        <PostCreateWizard />
      </div>
    </main>
  );
}