"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface MyProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  username: string;
  classe: string;
  matricule: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  createdAt: Date;
}

type AuthError = "auth_required";

/**
 * Récupère le profil complet de l'utilisateur actuellement connecté.
 * Il n'y a pas de paramètre "userId" : cette action ne peut renvoyer
 * que le profil du visiteur courant, jamais celui d'un tiers.
 */
export async function getMyProfile(): Promise<MyProfile | { error: AuthError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "auth_required" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      username: true,
      classe: true,
      matricule: true,
      bio: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  if (!dbUser) return { error: "auth_required" };
  return dbUser;
}

export interface UpdateProfileInput {
  classe: string;
  matricule: string;
  email: string;
}

type UpdateSuccess = { success: true };
type UpdateError = {
  error: "auth_required" | "invalid" | "email_taken" | "matricule_taken" | "unknown";
};

/** Met à jour classe, matricule et email — réservé au propriétaire du compte */
export async function updateMyProfile(
  input: UpdateProfileInput,
): Promise<UpdateSuccess | UpdateError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "auth_required" };

  const classe = input.classe.trim();
  const matricule = input.matricule.trim();
  const email = input.email.trim().toLowerCase();

  if (!classe || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "invalid" };
  }

  try {
    const [emailTaken, matriculeTaken] = await Promise.all([
      prisma.user.findFirst({
        where: { email, NOT: { id: user.id } },
        select: { id: true },
      }),
      matricule
        ? prisma.user.findFirst({
            where: { matricule, NOT: { id: user.id } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (emailTaken) return { error: "email_taken" };
    if (matriculeTaken) return { error: "matricule_taken" };

    // Met à jour l'email côté Supabase Auth uniquement si besoin
    // (déclenche le flux de confirmation standard de Supabase).
    const currentEmail = user.email?.toLowerCase();
    if (email !== currentEmail) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        console.error("Erreur mise à jour email Supabase:", authError);
        return { error: "unknown" };
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        classe,
        matricule: matricule || null,
        email,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return { error: "unknown" };
  }
}

type AvatarSuccess = { success: true; avatar: string | null };
type AvatarError = { error: "auth_required" | "unknown" };

/** Définit (ou retire, si url = null) la photo de profil de l'utilisateur connecté */
export async function updateMyAvatar(url: string | null): Promise<AvatarSuccess | AvatarError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "auth_required" };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: url },
    });

    revalidatePath("/profile");
    return { success: true, avatar: url };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    return { error: "unknown" };
  }
}

type DeleteSuccess = { success: true };
type DeleteError = { error: "auth_required" | "last_admin" | "unknown" };

/**
 * Supprime définitivement le compte de l'utilisateur connecté.
 * Les données applicatives liées (posts, commentaires, likes, réactions,
 * logs de modération dont il est modérateur, etc.) sont supprimées via
 * les cascades Prisma définies dans le schéma.
 *
 * Note : ce projet n'a pas de clé "service role" Supabase configurée
 * (seule NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY est utilisée). Supprimer le
 * compte d'authentification Supabase lui-même nécessite l'API admin, qui
 * exige cette clé. On supprime donc les données applicatives et on
 * déconnecte la session ; l'identifiant Supabase Auth restera présent tant
 * qu'une route d'administration avec service role n'aura pas été ajoutée.
 */
export async function deleteMyAccount(): Promise<DeleteSuccess | DeleteError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "auth_required" };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { error: "last_admin" };
    }

    await prisma.user.delete({ where: { id: user.id } });
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return { error: "unknown" };
  }
}