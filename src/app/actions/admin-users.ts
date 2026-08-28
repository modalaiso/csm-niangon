"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAdminAuthContext } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";

export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  prenom: string;
  nom: string;
  classe: string;
  role: Role;
  createdAt: Date;
}

export interface ListUsersInput {
  search?: string;
  role?: Role | "ALL";
  page?: number;
  pageSize?: number;
}

type ListUsersSuccess = {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
};
type ListUsersResult =
  | ListUsersSuccess
  | { error: "auth_required" | "forbidden" | "unknown" };

/** Liste paginée/filtrée des utilisateurs — réservée ADMIN */
export async function listUsers(
  input: ListUsersInput = {},
): Promise<ListUsersResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 15));
  const search = input.search?.trim();

  const where: Record<string, unknown> = {};
  if (input.role && input.role !== "ALL") where.role = input.role;
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { nom: { contains: search, mode: "insensitive" } },
      { prenom: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          username: true,
          prenom: true,
          nom: true,
          classe: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, pageSize };
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return { error: "unknown" };
  }
}

type UpdateRoleSuccess = { success: true };
type UpdateRoleError = {
  error: "auth_required" | "forbidden" | "not_found" | "last_admin" | "unknown";
};

/** Change le rôle d'un utilisateur — réservé ADMIN. Empêche de retirer le dernier admin. */
export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<UpdateRoleSuccess | UpdateRoleError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!target) return { error: "not_found" };

    if (target.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { error: "last_admin" };
    }

    await prisma.user.update({ where: { id: userId }, data: { role } });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "UPDATE_USER_ROLE",
        targetType: "User",
        targetId: userId,
        metadata: { from: target.role, to: role },
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    return { error: "unknown" };
  }
}
