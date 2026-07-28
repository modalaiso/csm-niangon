"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PostType, Role } from "@prisma/client";
import { PostStatus } from "@prisma/client";

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