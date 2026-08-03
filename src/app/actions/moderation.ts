"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ModerationAction, ModerationLogType } from "@prisma/client";
import { getModeratorAuthContext } from "@/lib/auth/admin-guard";

/* --------------------------- Mots-clés de modération --------------------------- */

export interface ModerationKeywordRow {
  id: string;
  phrase: string;
  action: ModerationAction;
  isActive: boolean;
  createdAt: Date;
}

type ListKeywordsResult =
  | { keywords: ModerationKeywordRow[] }
  | { error: "auth_required" | "forbidden" | "unknown" };

export async function listModerationKeywords(): Promise<ListKeywordsResult> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const keywords = await prisma.moderationKeyword.findMany({ orderBy: { createdAt: "desc" } });
    return { keywords };
  } catch (error) {
    console.error("Erreur lors du chargement des mots-clés:", error);
    return { error: "unknown" };
  }
}

type AddKeywordSuccess = { success: true; keyword: ModerationKeywordRow };
type AddKeywordError = { error: "auth_required" | "forbidden" | "invalid" | "duplicate" | "unknown" };

/** Ajoute un mot-clé/une phrase à surveiller (toujours normalisé en minuscules) */
export async function addModerationKeyword(
  phrase: string,
  action: ModerationAction,
): Promise<AddKeywordSuccess | AddKeywordError> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  const trimmed = phrase.trim().toLowerCase();
  if (trimmed.length < 2) return { error: "invalid" };

  try {
    const existing = await prisma.moderationKeyword.findUnique({ where: { phrase: trimmed } });
    if (existing) return { error: "duplicate" };

    const keyword = await prisma.moderationKeyword.create({
      data: { phrase: trimmed, action, createdBy: auth.user.id },
    });

    revalidatePath("/admin/moderation");
    return { success: true, keyword };
  } catch (error) {
    console.error("Erreur lors de l'ajout du mot-clé:", error);
    return { error: "unknown" };
  }
}

type SimpleSuccess = { success: true };
type SimpleError = { error: "auth_required" | "forbidden" | "not_found" | "unknown" };

export async function toggleModerationKeyword(
  id: string,
  isActive: boolean,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const existing = await prisma.moderationKeyword.findUnique({ where: { id } });
    if (!existing) return { error: "not_found" };

    await prisma.moderationKeyword.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot-clé:", error);
    return { error: "unknown" };
  }
}

export async function deleteModerationKeyword(id: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const existing = await prisma.moderationKeyword.findUnique({ where: { id } });
    if (!existing) return { error: "not_found" };

    await prisma.moderationKeyword.delete({ where: { id } });
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du mot-clé:", error);
    return { error: "unknown" };
  }
}

/* ------------------------ Vérification (utilisée à la création d'un commentaire) ------------------------ */

export interface KeywordMatch {
  phrase: string;
  action: ModerationAction;
}

/** Vérifie un contenu contre la liste active de mots-clés. Retourne le premier match trouvé. */
export async function checkContentAgainstKeywords(content: string): Promise<KeywordMatch | null> {
  try {
    const keywords = await prisma.moderationKeyword.findMany({ where: { isActive: true } });
    const normalized = content.toLowerCase();

    for (const keyword of keywords) {
      if (normalized.includes(keyword.phrase)) {
        return { phrase: keyword.phrase, action: keyword.action };
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification des mots-clés:", error);
    return null;
  }
}

/* ------------------------------ File de modération ------------------------------ */

export interface FlaggedCommentRow {
  id: string;
  content: string;
  createdAt: Date;
  flaggedKeyword: string | null;
  postId: string;
  postTitle: string;
  author: { username: string; prenom: string; nom: string };
}

type ListFlaggedResult =
  | { comments: FlaggedCommentRow[] }
  | { error: "auth_required" | "forbidden" | "unknown" };

/** Commentaires masqués automatiquement en attente de revue manuelle (action FLAG_FOR_REVIEW) */
export async function listFlaggedComments(): Promise<ListFlaggedResult> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const comments = await prisma.comment.findMany({
      where: { isFlagged: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        flaggedKeyword: true,
        postId: true,
        post: { select: { title: true } },
        user: { select: { username: true, prenom: true, nom: true } },
      },
    });

    return {
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        flaggedKeyword: c.flaggedKeyword,
        postId: c.postId,
        postTitle: c.post.title,
        author: c.user,
      })),
    };
  } catch (error) {
    console.error("Erreur lors du chargement de la file de modération:", error);
    return { error: "unknown" };
  }
}

/** Approuve un commentaire signalé : redevient visible normalement */
export async function approveFlaggedComment(commentId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true, content: true, userId: true },
    });
    if (!comment) return { error: "not_found" };

    await prisma.$transaction([
      prisma.comment.update({
        where: { id: commentId },
        data: { isFlagged: false, isHidden: false, flaggedKeyword: null },
      }),
      prisma.moderationLog.create({
        data: {
          type: "APPROVED",
          content: comment.content,
          authorId: comment.userId,
          postId: comment.postId,
          moderatorId: auth.user.id,
        },
      }),
    ]);

    revalidatePath(`/posts/${comment.postId}`);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'approbation du commentaire:", error);
    return { error: "unknown" };
  }
}

/** Rejette un commentaire signalé : suppression définitive */
export async function rejectFlaggedComment(commentId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true, content: true, userId: true },
    });
    if (!comment) return { error: "not_found" };

    await prisma.$transaction([
      prisma.comment.delete({ where: { id: commentId } }),
      prisma.moderationLog.create({
        data: {
          type: "REJECTED",
          content: comment.content,
          authorId: comment.userId,
          postId: comment.postId,
          moderatorId: auth.user.id,
        },
      }),
    ]);

    revalidatePath(`/posts/${comment.postId}`);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du rejet du commentaire:", error);
    return { error: "unknown" };
  }
}

/* ------------------------------- Journal de modération ------------------------------- */

export interface ModerationLogRow {
  id: string;
  type: ModerationLogType;
  content: string;
  matchedKeyword: string | null;
  createdAt: Date;
  postTitle: string | null;
}

type ListLogsResult = { logs: ModerationLogRow[] } | { error: "auth_required" | "forbidden" | "unknown" };

/** Historique de toutes les actions de modération (auto-suppressions incluses) — traçabilité */
export async function listModerationLogs(limit: number = 50): Promise<ListLogsResult> {
  const auth = await getModeratorAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const logs = await prisma.moderationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const postIds = Array.from(
      new Set(logs.map((l) => l.postId).filter((id): id is string => Boolean(id))),
    );
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true },
    });
    const postMap = new Map(posts.map((p) => [p.id, p.title]));

    return {
      logs: logs.map((l) => ({
        id: l.id,
        type: l.type,
        content: l.content,
        matchedKeyword: l.matchedKeyword,
        createdAt: l.createdAt,
        postTitle: l.postId ? (postMap.get(l.postId) ?? null) : null,
      })),
    };
  } catch (error) {
    console.error("Erreur lors du chargement du journal de modération:", error);
    return { error: "unknown" };
  }
}