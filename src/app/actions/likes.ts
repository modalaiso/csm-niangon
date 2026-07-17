"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface LikeInfo {
  count: number;
  likedByUser: boolean;
}

/** Nombre de likes d'un post + si l'utilisateur courant l'a déjà aimé */
export async function getLikeInfo(postId: string): Promise<LikeInfo> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [count, userLike] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      user
        ? prisma.like.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
          })
        : Promise.resolve(null),
    ]);

    return { count, likedByUser: Boolean(userLike) };
  } catch (error) {
    console.error("Erreur lors du chargement des likes:", error);
    return { count: 0, likedByUser: false };
  }
}

/** Ajoute ou retire le like de l'utilisateur courant sur un post */
export async function toggleLike(
  postId: string,
): Promise<{ liked: boolean; count: number } | { error: "auth_required" | "unknown" }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "auth_required" };
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { postId, userId: user.id } });
    }

    const count = await prisma.like.count({ where: { postId } });
    revalidatePath(`/posts/${postId}`);

    return { liked: !existing, count };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du like:", error);
    return { error: "unknown" };
  }
}