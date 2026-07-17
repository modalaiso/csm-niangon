import { getSearchResults } from "@/app/actions/search";
import Link from "next/link";
import { ArrowLeft, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Résultats de recherche | CSM Niangon",
  description: "Résultats de votre recherche",
};

const PAGE_SIZE = 20;

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  ACTU: { label: "Actu", className: "bg-blue-600" },
  ARTICLE: { label: "Article", className: "bg-emerald-500" },
  INFO: { label: "Info", className: "bg-amber-500" },
  INTERVIEW: { label: "Interview", className: "bg-purple-500" },
};

function formatRelativeTime(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months}m`;
  const years = Math.floor(months / 12);
  return `Il y a ${years}an${years > 1 ? "s" : ""}`;
}

interface SearchResultsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function SearchResultsPage({
  searchParams,
}: SearchResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { results, total } = await getSearchResults(query, PAGE_SIZE, offset);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(page));
    return `/search/results?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="container py-3 flex flex-row items-start sm:items-center justify-between gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span className="inline">Retour</span>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {total === 0
              ? "Aucun résultat trouvé"
              : `${total} résultat${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container px-3 sm:px-4 py-6 sm:py-8">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground mb-4">
              Aucun post ne correspond à votre recherche
            </p>
            <Link href="/">
              <Button className="text-white">Retour à l&apos;accueil</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((result) => {
                const badge = TYPE_BADGES[result.type] ?? {
                  label: result.type,
                  className: "bg-gray-500",
                };
                return (
                  <Link
                    key={result.id}
                    href={`/posts/${result.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      {result.thumbnail ? (
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Pas d&apos;image
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-bold text-foreground">
                        {result.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {result.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Créé par{" "}
                          <span className="font-medium text-foreground">
                            {result.author.username}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {result.views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatRelativeTime(result.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={pageHref(Math.max(1, currentPage - 1))}
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
                  href={pageHref(Math.min(totalPages, currentPage + 1))}
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