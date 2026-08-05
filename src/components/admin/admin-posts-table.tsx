"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Trash2, Eye, ThumbsUp, MessageCircle, Pencil, Loader2 } from "lucide-react";
import type { PostStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList, useRowSelection } from "@/components/admin/useAdminList";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/admin/table-pagination";
import {
  listAdminPosts,
  deletePost,
  updatePostStatus,
  bulkUpdatePostStatus,
  bulkDeletePosts,
  type AdminPostRow,
  type AdminPostStatusFilter,
  type AdminPostTypeFilter,
} from "@/app/actions/admin-posts";

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  ACTU: { label: "Actu", className: "bg-blue-600" },
  ARTICLE: { label: "Article", className: "bg-emerald-500" },
  INFO: { label: "Info", className: "bg-amber-500" },
  ANNONCE: { label: "Annonce", className: "bg-rose-500" },
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-slate-100 text-slate-600" },
  PUBLISHED: { label: "Publié", className: "bg-primary/10 text-primary" },
  ARCHIVED: { label: "Archivé", className: "bg-amber-100 text-amber-700" },
};

const STATUS_OPTIONS: { value: AdminPostStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "ARCHIVED", label: "Archivé" },
];

const TYPE_OPTIONS: { value: AdminPostTypeFilter; label: string }[] = [
  { value: "ALL", label: "Tous les types" },
  { value: "ACTU", label: "Actu" },
  { value: "ARTICLE", label: "Article" },
  { value: "INFO", label: "Info" },
  { value: "ANNONCE", label: "Annonce" },
];

const ROW_STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "PUBLISHED", label: "Publier" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "ARCHIVED", label: "Archiver" },
];

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const PAGE_SIZE = 15;

export function AdminPostsTable() {
  const router = useRouter();
  const [status, setStatus] = useState<AdminPostStatusFilter>("ALL");
  const [type, setType] = useState<AdminPostTypeFilter>("ALL");
  const {
    rows,
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
  } = useAdminList<AdminPostRow>(
    useCallback(
      async ({ search, page, pageSize }) => {
        const result = await listAdminPosts({ status, type, search, page, pageSize });
        if ("error" in result) {
          if (result.error === "auth_required") return { error: "auth_required" };
          return { error: "Impossible de charger les publications." };
        }
        return { items: result.posts, total: result.total };
      },
      [status, type],
    ),
    { pageSize: PAGE_SIZE },
  );
  const { selected, toggleSelected, toggleSelectAll, clearSelection } = useRowSelection();

  useEffect(() => {
    if (error === "auth_required") router.push("/login");
  }, [error, router]);

  useEffect(() => {
    clearSelection();
  }, [rows, clearSelection]);

  const handleDelete = (row: AdminPostRow) => {
    if (!window.confirm(`Supprimer définitivement "${row.title}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      const result = await deletePost(row.id);
      if ("error" in result) {
        setError("Impossible de supprimer ce post.");
        return;
      }
      load();
    });
  };

  const handleStatusChange = (row: AdminPostRow, nextStatus: PostStatus) => {
    startTransition(async () => {
      const result = await updatePostStatus(row.id, nextStatus);
      if ("error" in result) {
        setError("Impossible de changer le statut.");
        return;
      }
      load();
    });
  };

  const handleBulkStatus = (nextStatus: PostStatus) => {
    startTransition(async () => {
      const result = await bulkUpdatePostStatus(Array.from(selected), nextStatus);
      if ("error" in result) {
        setError("Impossible d'appliquer le changement groupé.");
        return;
      }
      load();
    });
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Supprimer définitivement ${selected.size} publication(s) ?`)) return;
    startTransition(async () => {
      const result = await bulkDeletePosts(Array.from(selected));
      if ("error" in result) {
        setError("Impossible de supprimer ces posts.");
        return;
      }
      load();
    });
  };

  let tableBodyContent = null;

  if (isLoading) {
    tableBodyContent = (
      <tr>
        <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </td>
      </tr>
    );
  } else if (rows.length === 0) {
    tableBodyContent = (
      <tr>
        <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
          Aucune publication ne correspond à ces filtres.
        </td>
      </tr>
    );
  } else {
    tableBodyContent = rows.map((row) => {
      const typeBadge = TYPE_BADGES[row.type] ?? { label: row.type, className: "bg-gray-500" };
      const statusBadge = STATUS_BADGES[row.status] ?? {
        label: row.status,
        className: "bg-gray-100 text-gray-600",
      };
      return (
        <tr key={row.id} className="align-middle hover:bg-accent/30">
          <td className="px-4 py-3">
            <input
              type="checkbox"
              checked={selected.has(row.id)}
              onChange={() => toggleSelected(row.id)}
              aria-label={`Sélectionner ${row.title}`}
              className="h-4 w-4 rounded border-input accent-primary"
            />
          </td>
          <td className="max-w-[260px] px-4 py-3">
            <Link href={`/posts/${row.id}`} className="line-clamp-1 font-medium text-foreground hover:underline">
              {row.title}
            </Link>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
                typeBadge.className,
              )}
            >
              {typeBadge.label}
            </span>
          </td>
          <td className="px-4 py-3">
            <Select
              value={row.status}
              onValueChange={(v) => handleStatusChange(row, v as PostStatus)}
            >
              <SelectTrigger
                className={cn("h-8 w-32 border-0 text-xs font-medium", statusBadge.className)}
              >
                <SelectValue>{statusBadge.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROW_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </td>
          <td className="px-4 py-3 text-muted-foreground">
            {row.author.prenom} {row.author.nom}
          </td>
          <td className="px-4 py-3">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              {row.viewsToday}
            </span>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{row.viewsTotal}</td>
          <td className="px-4 py-3">
            <span className="mr-3 inline-flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              {row.likesCount}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {row.commentsCount}
            </span>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{formatDate(row.publishedAt ?? row.createdAt)}</td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/posts/${row.id}/edit`}
                aria-label="Modifier"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Link>
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
      );
    });
  }

  return (
    <div>
      {/* Filtres */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un titre..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as AdminPostStatusFilter); setPage(1); }}>
          <SelectTrigger className="w-full bg-white sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v as AdminPostTypeFilter); setPage(1); }}>
          <SelectTrigger className="w-full bg-white sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Barre d'actions groupées */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {ROW_STATUS_OPTIONS.map((o) => (
              <Button
                key={o.value}
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handleBulkStatus(o.value)}
              >
                {o.label}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleBulkDelete}
              className="text-white"
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={() => toggleSelectAll(rows.map((r) => r.id))}
                  aria-label="Tout sélectionner"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
              </th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Vues (jour)</th>
              <th className="px-4 py-3">Vues (total)</th>
              <th className="px-4 py-3">Réactions</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tableBodyContent}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}