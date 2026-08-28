"use client";

import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { HomePostCard } from "@/app/actions/posts";
import { PostResults } from "@/components/posts/post-results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/ui/view-mode-toggle";
import { cn } from "@/lib/utils";

export interface FetchPostsParams {
  search: string;
  limit: number;
  offset: number;
}

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface PostTypeExplorerProps<T extends HomePostCard> {
  initialPosts: T[];
  initialTotal: number;
  fetchPosts: (
    params: FetchPostsParams,
  ) => Promise<{ posts: T[]; total: number }>;
  filterKey: unknown;
  filters?: React.ReactNode;
  searchPlaceholder: string;
  renderCount: (total: number) => string;
  renderEmptyMessage: (search: string) => string;
  renderBadge: (post: T) => React.ReactNode;
  emptyStateAction?: EmptyStateAction;
  pageSize?: number;
}

export function PostTypeExplorer<T extends HomePostCard>(
  props: Readonly<PostTypeExplorerProps<T>>,
) {
  const pageSize = props.pageSize ?? 20;
  const [posts, setPosts] = useState<T[]>(props.initialPosts);
  const [total, setTotal] = useState(props.initialTotal);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const [isPending, startTransition] = useTransition();
  const isFirstRun = useRef(true);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await props.fetchPosts({
        search: debouncedSearch,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setPosts(result.posts);
      setTotal(result.total);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, pageSize, props.fetchPosts]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    load();
  }, [load]);

  const handleClearSearch = () => setSearchInput("");

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={props.searchPlaceholder}
            aria-label={props.searchPlaceholder}
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
        <p className="text-xs text-muted-foreground sm:text-sm">
          {props.renderCount(total)}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">{props.filters}</div>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div
        className={cn("relative transition-opacity", isPending && "opacity-60")}
      >
        {isPending && (
          <div className="absolute right-0 top-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        )}

        <PostResults
          posts={posts}
          viewMode={viewMode}
          emptyStateMessage={props.renderEmptyMessage(debouncedSearch)}
          emptyStateAction={props.emptyStateAction}
          renderBadge={props.renderBadge}
        />
      </div>

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
