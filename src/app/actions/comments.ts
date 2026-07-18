"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CommentReactionType, Role } from "@prisma/client";

export interface PostComment {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  authorId: string;
  isHidden: boolean;
  isEdited: boolean;
  likeCount: number;
  dislikeCount: number;
  userReaction: CommentReactionType | null;
  replyToUsername: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canModerate: boolean;
  author: {
    username: string;
    prenom: string;
    nom: string;
    avatar: string | null;
  };
}

export interface CommentThread {
  root: PostComment;
  replies: PostComment[];
}

type RawComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  userId: string;
  isHidden: boolean;
  user: { username: string; prenom: string; nom: string; avatar: string | null };
  reactions: { userId: string; type: CommentReactionType }[];
};

type AuthContext = { userId: string | null; role: Role | null };

async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, role: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return { userId: user.id, role: dbUser?.role ?? null };
}

function isModerationRole(role: Role | null): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

function findRootId(c: RawComment, byId: Map<string, RawComment>): string {
  let current = c;
  while (current.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current.id;
}

/** Commentaires d'un post, organisés en fils (commentaire principal + réponses aplaties) */
export async function getPostComments(postId: string): Promise<CommentThread[]> {
  try {
    const { userId, role } = await getAuthContext();
    const canModerate = isModerationRole(role);

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        userId: true,
        isHidden: true,
        user: {
          select: { username: true, prenom: true, nom: true, avatar: true },
        },
        reactions: { select: { userId: true, type: true } },
      },
    });

    const byId = new Map(comments.map((c) => [c.id, c]));

    const toPostComment = (c: RawComment): PostComment => {
      const likeCount = c.reactions.filter((r) => r.type === "LIKE").length;
      const dislikeCount = c.reactions.filter((r) => r.type === "DISLIKE").length;
      const mine = userId ? c.reactions.find((r) => r.userId === userId) : undefined;
      const parent = c.parentId ? byId.get(c.parentId) : undefined;
      // On n'affiche la mention "@untel" que si on répond à une réponse (pas au commentaire principal)
      const replyToUsername = parent && parent.parentId ? parent.user.username : null;

      const isOwner = userId === c.userId;
      // On garde le contenu visible pour l'auteur et les modérateurs ;
      // les autres voient un message générique tant que le commentaire est masqué.
      const visibleContent =
        c.isHidden && !isOwner && !canModerate
          ? "Ce commentaire a été masqué par la modération."
          : c.content;

      return {
        id: c.id,
        content: visibleContent,
        createdAt: c.createdAt,
        parentId: c.parentId,
        authorId: c.userId,
        isHidden: c.isHidden,
        isEdited: c.updatedAt.getTime() - c.createdAt.getTime() > 1000,
        likeCount,
        dislikeCount,
        userReaction: mine ? mine.type : null,
        replyToUsername,
        canEdit: isOwner,
        canDelete: isOwner || canModerate,
        canModerate,
        author: c.user,
      };
    };

    const roots = comments.filter((c) => !c.parentId);

    const repliesByRoot = new Map<string, PostComment[]>();
    for (const c of comments) {
      if (!c.parentId) continue;
      const rootId = findRootId(c, byId);
      if (!repliesByRoot.has(rootId)) repliesByRoot.set(rootId, []);
      repliesByRoot.get(rootId)!.push(toPostComment(c));
    }

    const threads: CommentThread[] = roots.map((root) => ({
      root: toPostComment(root),
      replies: repliesByRoot.get(root.id) ?? [],
    }));

    // Commentaires principaux les plus récents en premier
    return threads.sort(
      (a, b) => b.root.createdAt.getTime() - a.root.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires:", error);
    return [];
  }
}

type AddCommentSuccess = { success: true };
type AddCommentError = { error: "empty" | "auth_required" | "unknown" };
type AddCommentResult = AddCommentSuccess | AddCommentError;

/** Publie un commentaire (ou une réponse si parentId est fourni) */
export async function addComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<AddCommentResult> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "empty" };
  }

  try {
    const { userId } = await getAuthContext();
    if (!userId) {
      return { error: "auth_required" };
    }

    await prisma.comment.create({
      data: { postId, userId, content: trimmed, parentId: parentId ?? null },
    });

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    return { error: "unknown" };
  }
}

type EditCommentSuccess = { success: true; content: string };
type EditCommentError = { error: "empty" | "auth_required" | "forbidden" | "not_found" | "unknown" };
type EditCommentResult = EditCommentSuccess | EditCommentError;

/** Modifie le contenu d'un commentaire — réservé à son auteur */
export async function editComment(
  commentId: string,
  content: string,
): Promise<EditCommentResult> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "empty" };
  }

  try {
    const { userId } = await getAuthContext();
    if (!userId) {
      return { error: "auth_required" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });
    if (!comment) {
      return { error: "not_found" };
    }
    if (comment.userId !== userId) {
      return { error: "forbidden" };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content: trimmed },
    });

    revalidatePath(`/posts/${comment.postId}`);
    return { success: true, content: trimmed };
  } catch (error) {
    console.error("Erreur lors de la modification du commentaire:", error);
    return { error: "unknown" };
  }
}

type DeleteCommentSuccess = { success: true };
type DeleteCommentError = { error: "auth_required" | "forbidden" | "not_found" | "unknown" };
type DeleteCommentResult = DeleteCommentSuccess | DeleteCommentError;

/** Supprime un commentaire — réservé à son auteur, ou aux modérateurs/admins */
export async function deleteComment(commentId: string): Promise<DeleteCommentResult> {
  try {
    const { userId, role } = await getAuthContext();
    if (!userId) {
      return { error: "auth_required" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });
    if (!comment) {
      return { error: "not_found" };
    }
    if (comment.userId !== userId && !isModerationRole(role)) {
      return { error: "forbidden" };
    }

    // La cascade Prisma (onDelete: Cascade sur parentId) supprime aussi les réponses
    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath(`/posts/${comment.postId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    return { error: "unknown" };
  }
}

type SetHiddenSuccess = { success: true; isHidden: boolean };
type SetHiddenError = { error: "auth_required" | "forbidden" | "not_found" | "unknown" };
type SetHiddenResult = SetHiddenSuccess | SetHiddenError;

/** Masque ou réaffiche un commentaire — réservé aux modérateurs/admins */
export async function setCommentHidden(
  commentId: string,
  hidden: boolean,
): Promise<SetHiddenResult> {
  try {
    const { userId, role } = await getAuthContext();
    if (!userId) {
      return { error: "auth_required" };
    }
    if (!isModerationRole(role)) {
      return { error: "forbidden" };
    }

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true },
    });
    if (!existing) {
      return { error: "not_found" };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isHidden: hidden },
    });

    revalidatePath(`/posts/${existing.postId}`);
    return { success: true, isHidden: hidden };
  } catch (error) {
    console.error("Erreur lors du masquage du commentaire:", error);
    return { error: "unknown" };
  }
}

type ReactionSuccess = {
  likeCount: number;
  dislikeCount: number;
  userReaction: CommentReactionType | null;
};
type ReactionError = { error: "auth_required" | "unknown" };
type ReactionResult = ReactionSuccess | ReactionError;

/** Like / dislike sur un commentaire (bascule si on reclique sur le même type) */
export async function toggleCommentReaction(
  commentId: string,
  type: CommentReactionType,
): Promise<ReactionResult> {
  try {
    const { userId } = await getAuthContext();
    if (!userId) {
      return { error: "auth_required" };
    }

    const existing = await prisma.commentReaction.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    let userReaction: CommentReactionType | null;
    if (existing && existing.type === type) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      userReaction = null;
    } else if (existing) {
      await prisma.commentReaction.update({ where: { id: existing.id }, data: { type } });
      userReaction = type;
    } else {
      await prisma.commentReaction.create({ data: { commentId, userId, type } });
      userReaction = type;
    }

    const [likeCount, dislikeCount, comment] = await Promise.all([
      prisma.commentReaction.count({ where: { commentId, type: "LIKE" } }),
      prisma.commentReaction.count({ where: { commentId, type: "DISLIKE" } }),
      prisma.comment.findUnique({ where: { id: commentId }, select: { postId: true } }),
    ]);

    if (comment) revalidatePath(`/posts/${comment.postId}`);

    return { likeCount, dislikeCount, userReaction };
  } catch (error) {
    console.error("Erreur lors de la réaction au commentaire:", error);
    return { error: "unknown" };
  }
}