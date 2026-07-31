"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminAuthContext } from "@/lib/auth/admin-guard";

export interface AdminCommentRow {
  id: string;
  content: string;
  createdAt: Date;
  isHidden: boolean;
  isFlagged: boolean;
  flaggedKeyword: string | null;
  postId: string;
  postTitle: string;
  author: { username: string; prenom: string; nom: string };
  likeCount: number;
  dislikeCount: number;
}

export type AdminCommentFilter = "ALL" | "FLAGGED" | "HIDDEN" | "VISIBLE";

export interface ListAdminCommentsInput {
  filter?: AdminCommentFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

type ListAdminCommentsSuccess = {
  comments: AdminCommentRow[];
  total: number;
  page: number;
  pageSize: number;
};
type ListAdminCommentsResult =
  | ListAdminCommentsSuccess
  | { error: "auth_required" | "forbidden" | "unknown" };

export async function listAdminComments(
  input: ListAdminCommentsInput = {},
): Promise<ListAdminCommentsResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 15));
  const search = input.search?.trim();

  const where: Record<string, unknown> = {};
  if (input.filter === "FLAGGED") where.isFlagged = true;
  if (input.filter === "HIDDEN") where.isHidden = true;
  if (input.filter === "VISIBLE") where.isHidden = false;
  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { post: { title: { contains: search, mode: "insensitive" } } },
      { user: { username: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          content: true,
          createdAt: true,
          isHidden: true,
          isFlagged: true,
          flaggedKeyword: true,
          postId: true,
          post: { select: { title: true } },
          user: { select: { username: true, prenom: true, nom: true } },
          reactions: { select: { type: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const rows: AdminCommentRow[] = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      isHidden: c.isHidden,
      isFlagged: c.isFlagged,
      flaggedKeyword: c.flaggedKeyword,
      postId: c.postId,
      postTitle: c.post.title,
      author: c.user,
      likeCount: c.reactions.filter((r) => r.type === "LIKE").length,
      dislikeCount: c.reactions.filter((r) => r.type === "DISLIKE").length,
    }));

    return { comments: rows, total, page, pageSize };
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires admin:", error);
    return { error: "unknown" };
  }
}

type SimpleSuccess = { success: true };
type SimpleError = { error: "auth_required" | "forbidden" | "not_found" | "unknown" };

/** Supprime un commentaire (et trace l'action dans le journal de modération) */
export async function deleteCommentAdmin(commentId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true, content: true, userId: true },
    });
    if (!comment) return { error: "not_found" };

    await prisma.$transaction([
      prisma.comment.delete({ where: { id: commentId } }),
      prisma.auditLog.create({
        data: {
          actorId: auth.user.id,
          actorRole: auth.user.role,
          action: "DELETE_COMMENT",
          targetType: "Comment",
          targetId: commentId,
        },
      }),
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
    revalidatePath("/admin/comments");
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    return { error: "unknown" };
  }
}

export async function setCommentHiddenAdmin(
  commentId: string,
  hidden: boolean,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true },
    });
    if (!comment) return { error: "not_found" };

    await prisma.comment.update({ where: { id: commentId }, data: { isHidden: hidden } });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: hidden ? "HIDE_COMMENT" : "UNHIDE_COMMENT",
        targetType: "Comment",
        targetId: commentId,
      },
    });

    revalidatePath(`/posts/${comment.postId}`);
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du masquage du commentaire:", error);
    return { error: "unknown" };
  }
}

type BulkSuccess = { success: true; count: number };
type BulkError = { error: "auth_required" | "forbidden" | "unknown" };

export async function bulkDeleteComments(commentIds: string[]): Promise<BulkSuccess | BulkError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (commentIds.length === 0) return { success: true, count: 0 };

  try {
    const comments = await prisma.comment.findMany({
      where: { id: { in: commentIds } },
      select: { postId: true },
    });
    const result = await prisma.comment.deleteMany({ where: { id: { in: commentIds } } });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "BULK_DELETE_COMMENTS",
        targetType: "Comment",
        targetId: commentIds.join(","),
        metadata: { count: result.count },
      },
    });

    const uniquePostIds = Array.from(new Set(comments.map((c) => c.postId)));
    for (const postId of uniquePostIds) revalidatePath(`/posts/${postId}`);
    revalidatePath("/admin/comments");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Erreur lors de la suppression groupée des commentaires:", error);
    return { error: "unknown" };
  }
}