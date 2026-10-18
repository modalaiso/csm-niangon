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
  schoolClassId: string | null;
  schoolClassName: string | null;
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
          schoolClassId: true,
          schoolClass: { select: { name: true } },
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(({ schoolClass, ...user }) => ({
        ...user,
        schoolClassName: schoolClass?.name ?? null,
      })),
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return { error: "unknown" };
  }
}

type UpdateUserSchoolClassResult =
  | { success: true }
  | {
      error:
        | "auth_required"
        | "forbidden"
        | "invalid"
        | "not_found"
        | "unknown";
    };

/** Associe un compte élève ou parent à une classe — réservé ADMIN. */
export async function updateUserSchoolClass(
  userId: string,
  schoolClassId: string | null,
): Promise<UpdateUserSchoolClassResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof userId !== "string" ||
    userId.length === 0 ||
    userId.length > 128 ||
    (schoolClassId !== null &&
      (typeof schoolClassId !== "string" ||
        schoolClassId.length === 0 ||
        schoolClassId.length > 128))
  ) {
    return { error: "invalid" };
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const target = await transaction.user.findUnique({
        where: { id: userId },
        select: { role: true, schoolClassId: true },
      });
      if (!target) return { error: "not_found" } as const;
      if (target.role !== "USER") return { error: "forbidden" } as const;

      if (schoolClassId) {
        const schoolClass = await transaction.schoolClass.findUnique({
          where: { id: schoolClassId },
          select: { id: true },
        });
        if (!schoolClass) return { error: "not_found" } as const;
      }

      await transaction.user.update({
        where: { id: userId },
        data: { schoolClassId },
      });
      await transaction.auditLog.create({
        data: {
          actorId: auth.user.id,
          actorRole: auth.user.role,
          action: "UPDATE_USER_SCHOOL_CLASS",
          targetType: "User",
          targetId: userId,
          metadata: { from: target.schoolClassId, to: schoolClassId },
        },
      });
      return { success: true } as const;
    });
    if ("error" in result) return result;

    revalidatePath("/admin/users");
    revalidatePath("/emplois-du-temps");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'association utilisateur-classe:", error);
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
