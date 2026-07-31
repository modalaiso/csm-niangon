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

/** Récupère l'utilisateur connecté avec son rôle DB, ou null s'il n'est pas authentifié */
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

/** Exige un rôle WRITER ou ADMIN, redirige sinon. À utiliser dans les layouts/pages du dashboard. */
export async function requireWriterOrAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WRITER" && user.role !== "ADMIN") redirect("/");
  return user;
}

/** Exige le rôle ADMIN strictement (gestion des utilisateurs, clés d'accès...) */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

type AdminAuthContext =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; error: "auth_required" | "forbidden" };

/** Variante pour server actions : retourne un objet d'erreur au lieu de rediriger */
export async function getAdminAuthContext(): Promise<AdminAuthContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth_required" };
  if (user.role !== "WRITER" && user.role !== "ADMIN") return { ok: false, error: "forbidden" };
  return { ok: true, user };
}