"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Eye,
  Calendar,
  Tag,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";
import { PostResults } from "@/components/posts/post-results";
import { cn, formatRelativeTime } from "@/lib/utils";
import { getActuPosts, type HomePostCard } from "@/app/actions/posts";

interface ActuExplorerProps {
  initialPosts: HomePostCard[];
  initialTotal: number;
  availableTags: string[];
}

const PAGE_SIZE = 20;

export function ActuExplorer(props: Readonly<ActuExplorerProps>) {
  const [posts, setPosts] = useState<HomePostCard[]>(props.initialPosts);
  const [total, setTotal] = useState(props.initialTotal);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const [isPending, startTransition] = useTransition();
  const isFirstRun = useRef(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Debounce de la saisie de recherche
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  // Retour à la page 1 dès qu'un filtre ou la recherche change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTag]);

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await getActuPosts({
        search: debouncedSearch,
        tag: activeTag,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setPosts(result.posts);
      setTotal(result.total);
    });
  }, [debouncedSearch, activeTag, page]);

  useEffect(() => {
    // Les données initiales viennent déjà du serveur : on évite un premier fetch inutile
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    load();
  }, [load]);

  const handleClearSearch = () => setSearchInput("");

  const plural = total > 1 ? "s" : "";
  const countText = total === 0 ? "Aucune actualité" : `${total} actualité${plural}`;

  const emptyStateMessage = debouncedSearch
    ? `Aucune actualité ne correspond à "${debouncedSearch}"`
    : activeTag
      ? `Aucune actualité avec le tag ${activeTag}`
      : "Aucune actualité pour l'instant";

  const resultsContent = (
    <PostResults
      posts={posts}
      viewMode={viewMode}
      emptyStateMessage={emptyStateMessage}
      emptyStateAction={
        activeTag && !debouncedSearch
          ? {
              label: "Réinitialiser le filtre",
              onClick: () => setActiveTag(null),
            }
          : undefined
      }
      renderBadge={() => (
        <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Actu
        </span>
      )}
    />
  );

  return (
    <div>
      {/* Barre de recherche + compteur */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher une actualité..."
            aria-label="Rechercher une actualité"
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">{countText}</p>
      </div>

      {/* Filtres par tags + mode d'affichage */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {props.availableTags.length > 0 && (
            <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              !activeTag
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground hover:border-primary/40",
            )}
          >
            Tous
          </button>
          {props.availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                activeTag === tag
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/40",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Résultats */}
      <div className={cn("relative transition-opacity", isPending && "opacity-60")}>
        {isPending && (
          <div className="absolute right-0 top-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        )}

        {resultsContent}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={page === 1 || isPending}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={page === totalPages || isPending}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}