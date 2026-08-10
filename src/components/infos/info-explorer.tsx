"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Eye,
  Calendar,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  getInfoPosts,
  type InfoPostCard,
  type InfoUrgencyFilter,
} from "@/app/actions/posts";

interface InfoExplorerProps {
  initialPosts: InfoPostCard[];
  initialTotal: number;
}

const PAGE_SIZE = 20;

const URGENCY_FILTERS: { label: string; value: InfoUrgencyFilter }[] = [
  { label: "Toutes", value: "ALL" },
  { label: "Normales", value: "NORMAL" },
  { label: "Urgentes", value: "URGENT" },
];

type ViewMode = "grid" | "list";

export function InfoExplorer(props: Readonly<InfoExplorerProps>) {
  const [posts, setPosts] = useState<InfoPostCard[]>(props.initialPosts);
  const [total, setTotal] = useState(props.initialTotal);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [urgency, setUrgency] = useState<InfoUrgencyFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const [isPending, startTransition] = useTransition();
  const isFirstRun = useRef(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Debounce de la saisie de recherche
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  // Retour à la page 1 dès qu'un filtre ou la recherche change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, urgency]);

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await getInfoPosts({
        search: debouncedSearch,
        urgency,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setPosts(result.posts);
      setTotal(result.total);
    });
  }, [debouncedSearch, urgency, page]);

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
  const countText = total === 0 ? "Aucune information" : `${total} information${plural}`;

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
            placeholder="Rechercher une information..."
            aria-label="Rechercher une information"
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

      {/* Filtres d'urgence + mode d'affichage */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {URGENCY_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setUrgency(item.value)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                urgency === item.value
                  ? item.value === "URGENT"
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/40",
              )}
            >
              {item.value === "URGENT" && <AlertTriangle className="h-3.5 w-3.5" />}
              {item.label}
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

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              {debouncedSearch
                ? `Aucune information ne correspond à "${debouncedSearch}"`
                : "Aucune information pour l'instant"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white transition-all hover:border-primary/40"
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
                  <span
                    className={cn(
                      "absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white",
                      post.isUrgent ? "bg-secondary text-secondary-foreground" : "bg-amber-500",
                    )}
                  >
                    {post.isUrgent && <AlertTriangle className="h-3 w-3" />}
                    {post.isUrgent ? "Urgent" : "Info"}
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
                  {/*<div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-28">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>*/}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white",
                          post.isUrgent ? "bg-secondary text-secondary-foreground" : "bg-amber-500",
                        )}
                      >
                        {post.isUrgent && <AlertTriangle className="h-3 w-3" />}
                        {post.isUrgent ? "Urgent" : "Info"}
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