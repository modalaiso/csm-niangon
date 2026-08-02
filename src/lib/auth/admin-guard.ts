import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  username: string;
  prenom: string;
  nom: string;
  avatar: string | null;
}

const DASHBOARD_ROLES: ReadonlySet<Role> = new Set(["WRITER", "MODERATOR", "ADMIN"]);
const POST_MANAGER_ROLES: ReadonlySet<Role> = new Set(["WRITER", "ADMIN"]);
const MODERATOR_ROLES: ReadonlySet<Role> = new Set(["MODERATOR", "ADMIN"]);

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true, username: true, prenom: true, nom: true, avatar: true },
  });

  if (!dbUser) return null;
  return dbUser;
}

/** Accès de base au dashboard : WRITER, MODERATOR ou ADMIN. À utiliser dans le layout /admin. */
export async function requireDashboardAccess(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!DASHBOARD_ROLES.has(user.role)) redirect("/");
  return user;
}

/** Gestion des publications : WRITER ou ADMIN uniquement. */
export async function requirePostManager(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!POST_MANAGER_ROLES.has(user.role)) redirect("/admin");
  return user;
}

/** Modération des commentaires : MODERATOR ou ADMIN uniquement. */
export async function requireModerator(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!MODERATOR_ROLES.has(user.role)) redirect("/admin");
  return user;
}

/** Administration complète (utilisateurs...) : ADMIN strictement. */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

type BasicAuthError = "auth_required" | "forbidden";
type AuthContext =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; error: BasicAuthError };

/** Variante server action : accès dashboard de base (WRITER/MODERATOR/ADMIN) */
export async function getDashboardAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth_required" };
  if (!DASHBOARD_ROLES.has(user.role)) return { ok: false, error: "forbidden" };
  return { ok: true, user };
}

/** Variante server action : gestion des publications (WRITER/ADMIN) */
export async function getPostManagerAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth_required" };
  if (!POST_MANAGER_ROLES.has(user.role)) return { ok: false, error: "forbidden" };
  return { ok: true, user };
}

/** Variante server action : modération (MODERATOR/ADMIN) */
export async function getModeratorAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth_required" };
  if (!MODERATOR_ROLES.has(user.role)) return { ok: false, error: "forbidden" };
  return { ok: true, user };
}

/** Variante server action : administration stricte (ADMIN) */
export async function getAdminAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth_required" };
  if (user.role !== "ADMIN") return { ok: false, error: "forbidden" };
  return { ok: true, user };
}