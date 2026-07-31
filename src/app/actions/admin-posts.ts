"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PostType, Role } from "@prisma/client";
import { PostStatus } from "@prisma/client";
import { getAdminAuthContext } from "@/lib/auth/admin-guard";

type AuthContext = { userId: string | null; role: Role | null };

const MAX_IMAGES = 15;

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

function canCreatePosts(role: Role | null): boolean {
  return role === "WRITER" || role === "ADMIN";
}

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let counter = 1;

  while (
    await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export interface CreatePostInput {
  type: PostType;
  title: string;
  summary: string;
  content: string;
  /** Galerie d'images (max 15). Toujours vide/ignorée pour le type ANNONCE. */
  images: string[];
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  /** Durée de vie du pop-up. Uniquement pris en compte pour le type ANNONCE. */
  expiresAt: Date | null;
}

type CreatePostSuccess = { success: true; id: string; slug: string };
type CreatePostError = {
  error: "auth_required" | "forbidden" | "invalid" | "unknown";
};
type CreatePostResult = CreatePostSuccess | CreatePostError;

export async function createPost(
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const { userId, role } = await getAuthContext();

  if (!userId) {
    return { error: "auth_required" };
  }
  if (!canCreatePosts(role)) {
    return { error: "forbidden" };
  }

  const title = input.title.trim();
  const summary = input.summary.trim();

  if (title.length < 5 || summary.length < 10) {
    return { error: "invalid" };
  }

  // Procédure différente selon le type : une ANNONCE n'a jamais d'image
  // et n'utilise expiresAt que dans ce cas-là.
  const isAnnouncement = input.type === "ANNONCE";
  const images = isAnnouncement ? [] : input.images.slice(0, MAX_IMAGES);
  const expiresAt =
    isAnnouncement && input.expiresAt && input.expiresAt.getTime() > Date.now()
      ? input.expiresAt
      : null;

  try {
    const slug = await generateUniqueSlug(title);
    const uniqueTags = Array.from(new Set(input.tags.map((t) => t.trim()).filter(Boolean)));

    const post = await prisma.post.create({
      data: {
        type: input.type,
        title,
        slug,
        content: input.content.trim() || null,
        summary,
        images,
        // La miniature (cartes, carrousel) reste dérivée de la première image
        thumbnail: images[0] ?? null,
        mediaUrl: null,
        authorId: userId,
        status: input.status as PostStatus,
        tags: uniqueTags,
        expiresAt,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true, slug: true },
    });

    // Garde la barre d'information (et le pop-up d'annonces) à jour
    if (input.status === "PUBLISHED") {
      revalidatePath("/");
    }
    revalidatePath("/admin/posts");

    return { success: true, id: post.id, slug: post.slug };
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    return { error: "unknown" };
  }
}

/* ------------------------------------------------------------------ */
/*                     Gestion des posts (dashboard)                   */
/* ------------------------------------------------------------------ */

export type AdminPostStatusFilter = "ALL" | PostStatus;
export type AdminPostTypeFilter = "ALL" | PostType;

export interface AdminPostRow {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  status: PostStatus;
  createdAt: Date;
  publishedAt: Date | null;
  viewsToday: number;
  viewsTotal: number;
  likesCount: number;
  commentsCount: number;
  author: { username: string; prenom: string; nom: string };
}

export interface ListAdminPostsInput {
  status?: AdminPostStatusFilter;
  type?: AdminPostTypeFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

type ListAdminPostsSuccess = {
  posts: AdminPostRow[];
  total: number;
  page: number;
  pageSize: number;
};
type ListAdminPostsError = { error: "auth_required" | "forbidden" | "unknown" };
type ListAdminPostsResult = ListAdminPostsSuccess | ListAdminPostsError;

/** Liste paginée/filtrée des posts pour le dashboard, avec vues du jour et réactions */
export async function listAdminPosts(
  input: ListAdminPostsInput = {},
): Promise<ListAdminPostsResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 15));
  const search = input.search?.trim();

  const where: Record<string, unknown> = {};
  if (input.status && input.status !== "ALL") where.status = input.status;
  if (input.type && input.type !== "ALL") where.type = input.type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          status: true,
          createdAt: true,
          publishedAt: true,
          author: { select: { username: true, prenom: true, nom: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const postIds = posts.map((p) => p.id);

    const [todayViews, totalViews] = await Promise.all([
      prisma.postView.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds }, createdAt: { gte: startOfDay } },
        _count: { postId: true },
      }),
      prisma.postView.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: { postId: true },
      }),
    ]);

    const todayMap = new Map(todayViews.map((v) => [v.postId, v._count.postId]));
    const totalMap = new Map(totalViews.map((v) => [v.postId, v._count.postId]));

    const rows: AdminPostRow[] = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      status: p.status,
      createdAt: p.createdAt,
      publishedAt: p.publishedAt,
      viewsToday: todayMap.get(p.id) ?? 0,
      viewsTotal: totalMap.get(p.id) ?? 0,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      author: p.author,
    }));

    return { posts: rows, total, page, pageSize };
  } catch (error) {
    console.error("Erreur lors du chargement des posts admin:", error);
    return { error: "unknown" };
  }
}

type DeletePostSuccess = { success: true };
type DeletePostError = {
  error: "auth_required" | "forbidden" | "not_found" | "unknown";
};

/** Supprime un post définitivement — réservé aux WRITER/ADMIN */
export async function deletePost(
  postId: string,
): Promise<DeletePostSuccess | DeletePostError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true },
    });
    if (!post) return { error: "not_found" };

    await prisma.post.delete({ where: { id: postId } });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "DELETE_POST",
        targetType: "Post",
        targetId: postId,
        metadata: { title: post.title },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return { error: "unknown" };
  }
}

type UpdateStatusSuccess = { success: true; status: PostStatus };
type UpdateStatusError = {
  error: "auth_required" | "forbidden" | "not_found" | "unknown";
};

/** Change la visibilité d'un post (DRAFT / PUBLISHED / ARCHIVED) */
export async function updatePostStatus(
  postId: string,
  status: PostStatus,
): Promise<UpdateStatusSuccess | UpdateStatusError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  try {
    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { status: true, publishedAt: true },
    });
    if (!existing) return { error: "not_found" };

    await prisma.post.update({
      where: { id: postId },
      data: {
        status,
        // On fixe publishedAt uniquement la première fois qu'un post est publié
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "UPDATE_POST_STATUS",
        targetType: "Post",
        targetId: postId,
        metadata: { from: existing.status, to: status },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    return { success: true, status };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { error: "unknown" };
  }
}

type BulkStatusSuccess = { success: true; updated: number };
type BulkStatusError = { error: "auth_required" | "forbidden" | "unknown" };

/** Change la visibilité de plusieurs posts d'un coup */
export async function bulkUpdatePostStatus(
  postIds: string[],
  status: PostStatus,
): Promise<BulkStatusSuccess | BulkStatusError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }
  if (postIds.length === 0) return { success: true, updated: 0 };

  try {
    const result = await prisma.post.updateMany({
      where: { id: { in: postIds } },
      data: {
        status,
        ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "BULK_UPDATE_POST_STATUS",
        targetType: "Post",
        targetId: postIds.join(","),
        metadata: { status, count: result.count },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");
    return { success: true, updated: result.count };
  } catch (error) {
    console.error("Erreur lors de la mise à jour groupée:", error);
    return { error: "unknown" };
  }
}

type BulkDeleteSuccess = { success: true; deleted: number };
type BulkDeleteError = { error: "auth_required" | "forbidden" | "unknown" };

/** Supprime plusieurs posts d'un coup */
export async function bulkDeletePosts(
  postIds: string[],
): Promise<BulkDeleteSuccess | BulkDeleteError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }
  if (postIds.length === 0) return { success: true, deleted: 0 };

  try {
    const result = await prisma.post.deleteMany({ where: { id: { in: postIds } } });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "BULK_DELETE_POSTS",
        targetType: "Post",
        targetId: postIds.join(","),
        metadata: { count: result.count },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");
    return { success: true, deleted: result.count };
  } catch (error) {
    console.error("Erreur lors de la suppression groupée:", error);
    return { error: "unknown" };
  }
}

// ── à ajouter à la fin du fichier src/app/actions/admin-posts.ts ──

export interface AdminPostEditData {
  id: string;
  type: PostType;
  title: string;
  summary: string;
  content: string;
  images: string[];
  tags: string[];
  status: PostStatus;
  expiresAt: Date | null;
}

type GetPostForEditResult =
  | { post: AdminPostEditData }
  | { error: "auth_required" | "forbidden" | "not_found" | "unknown" };

/** Charge un post pour le formulaire d'édition */
export async function getPostForEdit(postId: string): Promise<GetPostForEditResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        type: true,
        title: true,
        summary: true,
        content: true,
        images: true,
        tags: true,
        status: true,
        expiresAt: true,
      },
    });
    if (!post) return { error: "not_found" };

    return {
      post: {
        id: post.id,
        type: post.type,
        title: post.title,
        summary: post.summary,
        content: post.content ?? "",
        images: post.images,
        tags: post.tags,
        status: post.status,
        expiresAt: post.expiresAt,
      },
    };
  } catch (error) {
    console.error("Erreur lors du chargement du post pour édition:", error);
    return { error: "unknown" };
  }
}

export interface UpdatePostInput {
  type: PostType;
  title: string;
  summary: string;
  content: string;
  images: string[];
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  expiresAt: Date | null;
}

type UpdatePostSuccess = { success: true; id: string };
type UpdatePostError = {
  error: "auth_required" | "forbidden" | "invalid" | "not_found" | "unknown";
};

/** Met à jour un post existant — le slug n'est jamais régénéré pour ne pas casser les liens */
export async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<UpdatePostSuccess | UpdatePostError> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  const title = input.title.trim();
  const summary = input.summary.trim();
  if (title.length < 5 || summary.length < 10) {
    return { error: "invalid" };
  }

  try {
    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { status: true, publishedAt: true },
    });
    if (!existing) return { error: "not_found" };

    const isAnnouncement = input.type === "ANNONCE";
    const images = isAnnouncement ? [] : input.images.slice(0, MAX_IMAGES);
    const expiresAt =
      isAnnouncement && input.expiresAt && input.expiresAt.getTime() > Date.now()
        ? input.expiresAt
        : null;
    const uniqueTags = Array.from(new Set(input.tags.map((t) => t.trim()).filter(Boolean)));

    await prisma.post.update({
      where: { id: postId },
      data: {
        type: input.type,
        title,
        content: input.content.trim() || null,
        summary,
        images,
        thumbnail: images[0] ?? null,
        status: input.status as PostStatus,
        tags: uniqueTags,
        expiresAt,
        publishedAt:
          input.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "UPDATE_POST",
        targetType: "Post",
        targetId: postId,
        metadata: { from: existing.status, to: input.status },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    return { success: true, id: postId };
  } catch (error) {
    console.error("Erreur lors de la modification du post:", error);
    return { error: "unknown" };
  }
}