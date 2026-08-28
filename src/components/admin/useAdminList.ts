"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export interface AdminListResult<T> {
  items: T[];
  total: number;
}

export type AdminListFetcher<T> = (params: {
  search: string;
  page: number;
  pageSize: number;
}) => Promise<AdminListResult<T> | { error: string }>;

export interface UseAdminListOptions {
  pageSize?: number;
  searchDelayMs?: number;
}

export function useAdminList<T>(
  fetcher: AdminListFetcher<T>,
  options?: UseAdminListOptions,
) {
  const pageSize = options?.pageSize ?? 15;
  const searchDelayMs = options?.searchDelayMs ?? 300;

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasMounted = useRef(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetcher({ search, page, pageSize })
      .then((result) => {
        if ("error" in result) {
          setError(result.error);
          return;
        }

        setError(null);
        setRows(result.items);
        setTotal(result.total);
      })
      .catch(() => setError("Une erreur est survenue."))
      .finally(() => setIsLoading(false));
  }, [fetcher, page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setPage(1);
    const timeout = window.setTimeout(load, searchDelayMs);
    return () => window.clearTimeout(timeout);
  }, [load, searchDelayMs]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    setError,
    isPending,
    startTransition,
    load,
    totalPages,
  };
}

export function useRowSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelected((prev) =>
      prev.size === ids.length ? new Set() : new Set(ids),
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  return { selected, toggleSelected, toggleSelectAll, clearSelection };
}
