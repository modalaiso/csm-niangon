"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PostType, Role } from "@prisma/client";
import { PostStatus } from "@prisma/client";

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
  thumbnail: string | null;
  mediaUrl: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
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
        thumbnail: input.thumbnail,
        mediaUrl: input.mediaUrl,
        authorId: userId,
        status: input.status as PostStatus,
        tags: uniqueTags,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true, slug: true },
    });

    // Garde la barre d'information à jour dès qu'un post est publié
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