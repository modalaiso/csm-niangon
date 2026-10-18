"use client";

import type { Role } from "@prisma/client";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  type AdminUserRow,
  listUsers,
  updateUserRole,
  updateUserSchoolClass,
} from "@/app/actions/admin-users";
import { TablePagination } from "@/components/admin/table-pagination";
import { useAdminList } from "@/components/admin/useAdminList";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUsersTableProps {
  currentUserId: string;
  schoolClasses: { id: string; name: string }[];
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
    async ({
      search,
      page,
      pageSize,
    }: {
      search: string;
      page: number;
      pageSize: number;
    }) => {
      const result = await listUsers({
        search,
        role: roleFilter,
        page,
        pageSize,
      });
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
    if (
      !window.confirm(
        `Changer le rôle de ${row.prenom} ${row.nom} en "${nextRole}" ?`,
      )
    )
      return;

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

  const handleSchoolClassChange = (
    row: AdminUserRow,
    nextSchoolClassId: string,
  ) => {
    const schoolClassId =
      nextSchoolClassId === "none" ? null : nextSchoolClassId;
    if (row.schoolClassId === schoolClassId) return;

    const selectedClass = props.schoolClasses.find(
      (schoolClass) => schoolClass.id === schoolClassId,
    );
    const classLabel = selectedClass?.name ?? "aucune classe";
    if (
      !window.confirm(`Associer ${row.prenom} ${row.nom} à « ${classLabel} » ?`)
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateUserSchoolClass(row.id, schoolClassId);
      if ("error" in result) {
        setError("Impossible de modifier l'association à la classe.");
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
          <td
            colSpan={6}
            className="px-4 py-10 text-center text-muted-foreground"
          >
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </td>
        </tr>
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-10 text-center text-muted-foreground"
          >
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
              {isSelf && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  (vous)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">@{row.username}</p>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
          <td className="px-4 py-3 text-muted-foreground">{row.classe}</td>
          <td className="px-4 py-3">
            {row.role === "USER" ? (
              <Select
                value={row.schoolClassId ?? "none"}
                onValueChange={(value) => handleSchoolClassChange(row, value)}
                disabled={isPending}
              >
                <SelectTrigger
                  aria-label={`Classe associée à ${row.prenom} ${row.nom}`}
                  className="h-9 w-48 rounded-md border border-input bg-background text-xs font-medium text-foreground shadow-none"
                >
                  <SelectValue placeholder="Aucune classe" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="none">Aucune classe associée</SelectItem>
                  {props.schoolClasses.map((schoolClass) => (
                    <SelectItem key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-muted-foreground">Personnel</span>
            )}
          </td>
          <td className="px-4 py-3">
            {isSelf ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                <ShieldCheck className="h-3 w-3" />
                {ROW_ROLE_OPTIONS.find((o) => o.value === row.role)?.label}
              </span>
            ) : (
              <Select
                value={row.role}
                onValueChange={(v) => handleRoleChange(row, v as Role)}
                disabled={isPending}
              >
                <SelectTrigger
                  aria-label={`Rôle de ${row.prenom} ${row.nom}`}
                  className="h-8 w-40 rounded-md border border-input bg-background text-xs font-medium text-foreground shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border bg-background text-foreground shadow-md">
                  {ROW_ROLE_OPTIONS.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="rounded-sm focus:bg-primary/10 focus:text-foreground"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </td>
          <td className="px-4 py-3 text-muted-foreground">
            {formatDate(row.createdAt)}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un email, un pseudo..."
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as Role | "ALL")}
        >
          <SelectTrigger className="w-full bg-background sm:w-48">
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

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Classe associée</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{renderTableBody()}</tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
