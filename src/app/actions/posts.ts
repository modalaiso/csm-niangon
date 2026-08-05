"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus, PostType } from "@prisma/client";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPostViewCount } from "@/lib/viewCount";

export interface HomePostCard {
  id: string;
  type: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string | null;
  views: number;
  publishedAt: Date | null;
  tags: string[];
  author: {
    id?: string;
    username?: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
  };
}

export interface PostDetail {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string;
  thumbnail: string | null;
  mediaUrl: string | null;
  images: string[];
  views: number;
  tags: string[];
  publishedAt: Date | null;
  author: {
    username: string;
    prenom: string;
    nom: string;
    avatar: string | null;
  };
}

const cardSelect = {
  id: true,
  type: true,
  title: true,
  slug: true,
  summary: true,
  thumbnail: true,
  publishedAt: true,
  tags: true,
  author: { select: { id: true, username: true, prenom: true, nom: true, avatar: true } },
} as const;

// Transformer les données Prisma en format HomePostCard avec le count de vues
async function transformPostCard(post: any): Promise<HomePostCard> {
  const views = await getPostViewCount(post.id);
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    thumbnail: post.thumbnail,
    views,
    publishedAt: post.publishedAt,
    tags: post.tags ?? [],
    author: post.author,
  };
}

/** Récupère les publications publiées excluant les annonces */
async function fetchPublishedPostCards({ limit }: { limit: number; }): Promise<HomePostCard[]> {
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, type: { not: PostType.ANNONCE } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });

  return Promise.all(posts.map(transformPostCard));
}

/** Les 5 dernières publications, pour le carrousel héro */
export async function getFeaturedPosts(limit = 5): Promise<HomePostCard[]> {
  return fetchPublishedPostCards({ limit });
}

/** Toutes les publications récentes, pour la grille */
export async function getPublishedPosts(limit = 40): Promise<HomePostCard[]> {
  return fetchPublishedPostCards({ limit });
}

/** Un post publié, avec son contenu complet, pour la page de détail */
export async function getPostById(id: string): Promise<PostDetail | null> {
  try {
    const post = await prisma.post.findFirst({
      where: { id, status: PostStatus.PUBLISHED },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        content: true,
        summary: true,
        thumbnail: true,
        mediaUrl: true,
        images: true,
        tags: true,
        publishedAt: true,
        author: { select: { username: true, prenom: true, nom: true, avatar: true } },
      },
    });

    if (!post) return null;

    // Track les vues : une seule vue par utilisateur/visiteur
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const headersList = await headers();
      const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

      // Vérifier si cet utilisateur/visiteur a déjà vu ce post
      const existingView = await prisma.postView.findFirst({
        where: {
          postId: post.id,
          ...(user
            ? { OR: [{ userId: user.id }, { ipAddress }] }
            : { ipAddress }),
        },
      });

      // Si pas de vue existante, en créer une
      if (!existingView) {
        try {
          await prisma.postView.create({
            data: {
              postId: post.id,
              userId: user?.id || null,
              ipAddress: user ? null : ipAddress, // Seulement l'IP si pas connecté
            },
          });
        } catch (createError: any) {
          // Ignorer les erreurs de duplicate key (race condition)
          if (createError.code !== "P2002") {
            throw createError;
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du tracking des vues:", error);
      // Ne pas bloquer l'affichage du post en cas d'erreur
    }

    // Récupérer le count de vues
    const viewCount = await getPostViewCount(post.id);

    // Transformer et retourner le post avec le count de vues
    return {
      id: post.id,
      type: post.type,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      thumbnail: post.thumbnail,
      mediaUrl: post.mediaUrl,
      images: post.images,
      views: viewCount,
      tags: post.tags,
      publishedAt: post.publishedAt,
      author: post.author,
    };
  } catch (error) {
    console.error("Erreur lors du chargement du post:", error);
    return null;
  }
}

/** Autres publications du même type, pour la section "à découvrir aussi" */
export async function getRelatedPosts(
  postId: string,
  type: string,
  limit = 4,
): Promise<HomePostCard[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        type: type as PostType,
        id: { not: postId },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: cardSelect,
    });
    return Promise.all(posts.map(transformPostCard));
  } catch (error) {
    console.error("Erreur lors du chargement des publications similaires:", error);
    return [];
  }
}

/**
 * Publications publiées d'un type donné, paginées, avec filtre optionnel par tag —
 * utilisé par /actus, /articles, /infos
 */
export async function getPostsByType(
  type: PostType,
  limit: number = 20,
  offset: number = 0,
  tag?: string | null,
): Promise<{ posts: HomePostCard[]; total: number }> {
  try {
    const where = {
      status: PostStatus.PUBLISHED,
      type,
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
        select: cardSelect,
      }),
      prisma.post.count({ where }),
    ]);

    const results = await Promise.all(posts.map(transformPostCard));
    return { posts: results, total };
  } catch (error) {
    console.error("Erreur lors du chargement des publications par type:", error);
    return { posts: [], total: 0 };
  }
}

/** Liste des tags distincts utilisés par les publications publiées d'un type donné */
export async function getPostTagsByType(type: PostType): Promise<string[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, type },
      select: { tags: true },
    });

    const unique = new Set<string>();
    for (const post of posts) {
      for (const t of post.tags) {
        if (t.trim()) unique.add(t.trim());
      }
    }

    return Array.from(unique).sort((a, b) => a.localeCompare(b, "fr"));
  } catch (error) {
    console.error("Erreur lors du chargement des tags:", error);
    return [];
  }
}

/* ------------------------------ Page Informations ------------------------------ */

export interface InfoPostCard extends HomePostCard {
  isUrgent: boolean;
}

export type InfoUrgencyFilter = "ALL" | "URGENT" | "NORMAL";

const URGENT_TAG = "urgent";

export interface GetInfoPostsParams {
  search?: string;
  urgency?: InfoUrgencyFilter;
  limit?: number;
  offset?: number;
}

/**
 * Publications de type INFO publiées, avec recherche (titre/résumé/info)
 * et filtre par urgence — dédié à la page /infos.
 */
export async function getInfoPosts(
  params: GetInfoPostsParams = {},
): Promise<{ posts: InfoPostCard[]; total: number }> {
  const { search, urgency = "ALL", limit = 20, offset = 0 } = params;

  try {
    const where: Record<string, unknown> = {
      status: PostStatus.PUBLISHED,
      type: PostType.INFO,
    };

    if (urgency === "URGENT") {
      where.tags = { has: URGENT_TAG };
    } else if (urgency === "NORMAL") {
      where.NOT = { tags: { has: URGENT_TAG } };
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { title: { contains: trimmedSearch, mode: "insensitive" } },
        { summary: { contains: trimmedSearch, mode: "insensitive" } },
        { info: { contains: trimmedSearch, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
        select: cardSelect,
      }),
      prisma.post.count({ where }),
    ]);

    const results = await Promise.all(
      posts.map(async (p: any) => {
        const card = await transformPostCard(p);
        return {
          ...card,
          isUrgent: (p.tags ?? []).some((t: string) => t.toLowerCase() === URGENT_TAG),
        };
      }),
    );

    return { posts: results, total };
  } catch (error) {
    console.error("Erreur lors du chargement des informations:", error);
    return { posts: [], total: 0 };
  }
}

/* ------------------------------ Page Actualités ------------------------------ */

export interface GetActuPostsParams {
  search?: string;
  tag?: string | null;
  limit?: number;
  offset?: number;
}

/**
 * Publications de type ACTU publiées, avec recherche (titre/résumé)
 * et filtre par tag — dédié à la page /actus.
 */
export async function getActuPosts(
  params: GetActuPostsParams = {},
): Promise<{ posts: HomePostCard[]; total: number }> {
  const { search, tag, limit = 20, offset = 0 } = params;

  try {
    const where: Record<string, unknown> = {
      status: PostStatus.PUBLISHED,
      type: PostType.ACTU,
    };

    if (tag) {
      where.tags = { has: tag };
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { title: { contains: trimmedSearch, mode: "insensitive" } },
        { summary: { contains: trimmedSearch, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
        select: cardSelect,
      }),
      prisma.post.count({ where }),
    ]);

    const results = await Promise.all(posts.map(transformPostCard));
    return { posts: results, total };
  } catch (error) {
    console.error("Erreur lors du chargement des actualités:", error);
    return { posts: [], total: 0 };
  }
}