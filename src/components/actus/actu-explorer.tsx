"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Eye,
  Calendar,
  Tag,
  LayoutGrid,
  List as ListIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { getActuPosts, type HomePostCard } from "@/app/actions/posts";

interface ActuExplorerProps {
  initialPosts: HomePostCard[];
  initialTotal: number;
  availableTags: string[];
}

const PAGE_SIZE = 20;
type ViewMode = "grid" | "list";

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

        <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-border bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Affichage en grille"
            aria-pressed={viewMode === "grid"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="Affichage en liste"
            aria-pressed={viewMode === "list"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className={cn("relative transition-opacity", isPending && "opacity-60")}>
        {isPending && (
          <div className="absolute right-0 top-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              {debouncedSearch
                ? `Aucune actualité ne correspond à "${debouncedSearch}"`
                : activeTag
                  ? `Aucune actualité avec le tag #${activeTag}`
                  : "Aucune actualité pour l'instant"}
            </p>
            {activeTag && !debouncedSearch && (
              <Button variant="outline" className="mt-4 rounded-full" onClick={() => setActiveTag(null)}>
                Réinitialiser le filtre
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
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
                  <h3 className="line-clamp-1 text-base font-bold text-foreground">{post.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
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
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-accent/40"
                >
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-28">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        Actu
                      </span>
                      <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
                        {post.title}
                      </h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                      {post.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
                      <span>
                        Créé par{" "}
                        <span className="font-medium text-foreground">
                          {post.author.prenom} {post.author.nom}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeTime(post.publishedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
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