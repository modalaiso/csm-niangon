import { getActuPosts, getPostTagsByType } from "@/app/actions/posts";
import { ActuExplorer } from "@/components/actus/actu-explorer";

export const metadata = {
  title: "Actualités | CSM Niangon",
  description: "Toutes les actualités du CSM Niangon",
};

export default async function ActusPage() {
  const [{ posts, total }, availableTags] = await Promise.all([
    getActuPosts({ limit: 20, offset: 0 }),
    getPostTagsByType("ACTU"),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 mt-16 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Actualités</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualité récente du CSM Niangon
        </p>
      </div>

      <div className="container px-3 sm:px-4 pb-10">
        <ActuExplorer
          initialPosts={posts}
          initialTotal={total}
          availableTags={availableTags}
        />
      </div>
    </main>
  );
}
