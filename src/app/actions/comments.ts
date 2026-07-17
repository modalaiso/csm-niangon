"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PostComment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    username: string;
    prenom: string;
    nom: string;
    avatar: string | null;
  };
}

/** Commentaires d'un post, les plus récents en premier */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: { username: true, prenom: true, nom: true, avatar: true },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.user,
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires:", error);
    return [];
  }
}

/** Publie un commentaire pour l'utilisateur courant */
export async function addComment(
  postId: string,
  content: string,
): Promise<{ success: true } | { error: "empty" | "auth_required" | "unknown" }> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "empty" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "auth_required" };
    }

    await prisma.comment.create({
      data: { postId, userId: user.id, content: trimmed },
    });

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    return { error: "unknown" };
  }
}