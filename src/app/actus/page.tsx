import Link from "next/link";
import { Eye, Calendar, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { getPostsByType, getPostTagsByType } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";

export const metadata = {
  title: "Actualités | CSM Niangon",
  description: "Toutes les actualités du CSM Niangon",
};

const PAGE_SIZE = 20;

interface ActusPageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function ActusPage(props: Readonly<ActusPageProps>) {
  const resolvedSearchParams = await props.searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const activeTag = resolvedSearchParams.tag?.trim() || null;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ posts, total }, availableTags] = await Promise.all([
    getPostsByType("ACTU", PAGE_SIZE, offset, activeTag),
    getPostTagsByType("ACTU"),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: { page?: number; tag?: string | null }) => {
    const search = new URLSearchParams();
    const nextTag = params.tag !== undefined ? params.tag : activeTag;
    const nextPage = params.page ?? 1;
    if (nextTag) search.set("tag", nextTag);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/actus${query ? `?${query}` : ""}`;
  };

  const plural = total > 1 ? "s" : "";
  const countText = total === 0 ? "Aucune actualité" : `${total} actualité${plural}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 mt-16 pb-6 flex flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Actualités</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Actualité récente du CSM Niangon
          </p>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">{countText}</p>
      </div>

      {/* Filtre par tags */}
      {availableTags.length > 0 && (
        <div className="container px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Link href={buildHref({ tag: null, page: 1 })}>
              <span
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  !activeTag
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary/40",
                )}
              >
                Tous
              </span>
            </Link>
            {availableTags.map((tag) => (
              <Link key={tag} href={buildHref({ tag, page: 1 })}>
                <span
                  className={cn(
                    "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    activeTag === tag
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:border-primary/40",
                  )}
                >
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="container px-3 sm:px-4 py-6 sm:py-8">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              {activeTag
                ? `Aucune actualité avec le tag #${activeTag}`
                : "Aucune actualité pour l'instant"}
            </p>
            {activeTag && (
              <Link href={buildHref({ tag: null, page: 1 })} className="mt-4">
                <Button variant="outline" className="rounded-full">
                  Réinitialiser le filtre
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Pas d&apos;image
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Actu
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-bold text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {post.summary}
                    </p>
                    {/*{post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}*/}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Créé par{" "}
                        <span className="font-medium text-foreground">
                          {post.author.prenom} {post.author.nom}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatRelativeTime(post.publishedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={buildHref({ page: Math.max(1, currentPage - 1) })}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    "pointer-events-auto",
                    currentPage === 1 && "pointer-events-none opacity-40",
                  )}
                >
                  <Button variant="outline" size="icon" className="rounded-full">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>

                <span className="px-3 text-sm text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>

                <Link
                  href={buildHref({ page: Math.min(totalPages, currentPage + 1) })}
                  aria-disabled={currentPage === totalPages}
                  className={cn(
                    "pointer-events-auto",
                    currentPage === totalPages && "pointer-events-none opacity-40",
                  )}
                >
                  <Button variant="outline" size="icon" className="rounded-full">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}