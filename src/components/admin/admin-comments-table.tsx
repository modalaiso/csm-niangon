"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Trash2, Eye, EyeOff, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/admin/table-pagination";
import {
  listAdminComments,
  deleteCommentAdmin,
  setCommentHiddenAdmin,
  bulkDeleteComments,
  type AdminCommentRow,
  type AdminCommentFilter,
} from "@/app/actions/admin-comments";

const FILTER_OPTIONS: { value: AdminCommentFilter; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "FLAGGED", label: "Signalés" },
  { value: "HIDDEN", label: "Masqués" },
  { value: "VISIBLE", label: "Visibles" },
];

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 15;

export function AdminCommentsTable() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminCommentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<AdminCommentFilter>("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(() => {
    setIsLoading(true);
    listAdminComments({ filter, search, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if ("error" in result) {
          if (result.error === "auth_required") router.push("/login");
          else setError("Impossible de charger les commentaires.");
          return;
        }
        setError(null);
        setRows(result.comments);
        setTotal(result.total);
        setSelected(new Set());
      })
      .catch(() => setError("Une erreur est survenue."))
      .finally(() => setIsLoading(false));
  }, [filter, search, page, router]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  useEffect(() => {
    setPage(1);
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  };

  const handleDelete = (row: AdminCommentRow) => {
    if (!window.confirm("Supprimer définitivement ce commentaire ?")) return;
    startTransition(async () => {
      const result = await deleteCommentAdmin(row.id);
      if ("error" in result) {
        setError("Impossible de supprimer ce commentaire.");
        return;
      }
      load();
    });
  };

  const handleToggleHidden = (row: AdminCommentRow) => {
    startTransition(async () => {
      const result = await setCommentHiddenAdmin(row.id, !row.isHidden);
      if ("error" in result) {
        setError("Impossible de changer la visibilité.");
        return;
      }
      load();
    });
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Supprimer définitivement ${selected.size} commentaire(s) ?`)) return;
    startTransition(async () => {
      const result = await bulkDeleteComments(Array.from(selected));
      if ("error" in result) {
        setError("Impossible de supprimer ces commentaires.");
        return;
      }
      load();
    });
  };

  const tableBody = (() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </td>
        </tr>
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
            Aucun commentaire ne correspond à ces filtres.
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <tr key={row.id} className="align-top hover:bg-accent/30">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selected.has(row.id)}
            onChange={() => toggleSelected(row.id)}
            aria-label="Sélectionner"
            className="h-4 w-4 rounded border-input accent-primary"
          />
        </td>
        <td className="max-w-[280px] px-4 py-3">
          <p className="line-clamp-2 text-foreground">{row.content}</p>
          {row.flaggedKeyword && (
            <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              mot-clé : {row.flaggedKeyword}
            </span>
          )}
        </td>
        <td className="max-w-[180px] px-4 py-3">
          <Link href={`/posts/${row.postId}`} className="line-clamp-2 text-primary hover:underline">
            {row.postTitle}
          </Link>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {row.author.prenom} {row.author.nom}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-[11px] font-medium",
              row.isHidden ? "bg-slate-100 text-slate-600" : "bg-primary/10 text-primary",
            )}
          >
            {row.isHidden ? "Masqué" : "Visible"}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="mr-3 inline-flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {row.likeCount}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ThumbsDown className="h-3.5 w-3.5" />
            {row.dislikeCount}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(row.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleToggleHidden(row)}
              disabled={isPending}
              aria-label={row.isHidden ? "Réafficher" : "Masquer"}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {row.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={isPending}
              aria-label="Supprimer"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  })();

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un contenu, un post, un auteur..."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as AdminCommentFilter)}>
          <SelectTrigger className="w-full bg-white sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={handleBulkDelete}
            className="ml-auto text-white"
          >
            Supprimer la sélection
          </Button>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
              </th>
              <th className="px-4 py-3">Commentaire</th>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Réactions</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{tableBody}</tbody>
        </table>
      </div>

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}