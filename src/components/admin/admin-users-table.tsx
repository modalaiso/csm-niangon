"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { Role } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminList } from "@/components/admin/useAdminList";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/admin/table-pagination";
import { listUsers, updateUserRole, type AdminUserRow } from "@/app/actions/admin-users";

interface AdminUsersTableProps {
  currentUserId: string;
}

const ROLE_OPTIONS: { value: Role | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les rôles" },
  { value: "USER", label: "Utilisateur" },
  { value: "MODERATOR", label: "Modérateur" },
  { value: "WRITER", label: "Rédacteur" },
  { value: "ADMIN", label: "Administrateur" },
];

const ROW_ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "USER", label: "Utilisateur" },
  { value: "MODERATOR", label: "Modérateur" },
  { value: "WRITER", label: "Rédacteur" },
  { value: "ADMIN", label: "Administrateur" },
];

const ROLE_BADGES: Record<Role, string> = {
  USER: "bg-slate-100 text-slate-600",
  MODERATOR: "bg-amber-100 text-amber-700",
  WRITER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-primary/10 text-primary",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function AdminUsersTable(props: Readonly<AdminUsersTableProps>) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const fetchUsers = useCallback(
    async ({ search, page, pageSize }: { search: string; page: number; pageSize: number }) => {
      const result = await listUsers({ search, role: roleFilter, page, pageSize });
      if ("error" in result) {
        if (result.error === "auth_required") return { error: "auth_required" };
        return { error: "Impossible de charger les utilisateurs." };
      }
      return { items: result.users, total: result.total };
    },
    [roleFilter],
  );

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
  } = useAdminList<AdminUserRow>(fetchUsers, { pageSize: 15 });

  useEffect(() => {
    if (error === "auth_required") router.push("/login");
  }, [error, router]);

  const handleRoleChange = (row: AdminUserRow, nextRole: Role) => {
    if (row.id === props.currentUserId) return;
    if (!window.confirm(`Changer le rôle de ${row.prenom} ${row.nom} en "${nextRole}" ?`)) return;

    startTransition(async () => {
      const result = await updateUserRole(row.id, nextRole);
      if ("error" in result) {
        if (result.error === "last_admin") {
          setError("Impossible : il doit rester au moins un administrateur.");
        } else {
          setError("Impossible de changer ce rôle.");
        }
        return;
      }
      setError(null);
      load();
    });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </td>
        </tr>
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
            Aucun utilisateur ne correspond à ces filtres.
          </td>
        </tr>
      );
    }

    return rows.map((row) => {
      const isSelf = row.id === props.currentUserId;
      return (
        <tr key={row.id} className="hover:bg-accent/30">
          <td className="px-4 py-3">
            <p className="font-medium text-foreground">
              {row.prenom} {row.nom}
              {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(vous)</span>}
            </p>
            <p className="text-xs text-muted-foreground">@{row.username}</p>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
          <td className="px-4 py-3 text-muted-foreground">{row.classe}</td>
          <td className="px-4 py-3">
            {isSelf ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  ROLE_BADGES[row.role],
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                {ROW_ROLE_OPTIONS.find((o) => o.value === row.role)?.label}
              </span>
            ) : (
              <Select
                value={row.role}
                onValueChange={(v) => handleRoleChange(row, v as Role)}
                disabled={isPending}
              >
                <SelectTrigger className={cn("h-8 w-40 border-0 text-xs font-medium", ROLE_BADGES[row.role])}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROW_ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </td>
          <td className="px-4 py-3 text-muted-foreground">{formatDate(row.createdAt)}</td>
        </tr>
      );
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un email, un pseudo..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "ALL")}>
          <SelectTrigger className="w-full bg-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{renderTableBody()}</tbody>
        </table>
      </div>

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}