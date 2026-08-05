import { getInfoPosts } from "@/app/actions/posts";
import { InfoExplorer } from "@/components/infos/info-explorer";

export const metadata = {
  title: "Informations | CSM Niangon",
  description: "Toutes les informations du CSM Niangon",
};

export default async function InfosPage() {
  const { posts, total } = await getInfoPosts({ limit: 20, offset: 0 });

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 mt-16 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Informations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes les informations du CSM Niangon
        </p>
      </div>

      <div className="container px-3 sm:px-4 pb-10">
        <InfoExplorer initialPosts={posts} initialTotal={total} />
      </div>
    </main>
  );
}