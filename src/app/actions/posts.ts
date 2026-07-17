"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus, PostType } from "@prisma/client";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface HomePostCard {
  id: string;
  type: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string | null;
  views: number;
  publishedAt: Date | null;
  author: {
    username: string;
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
  author: { select: { username: true } },
} as const;

// Récupérer le count de vues pour un post
async function getPostViewCount(postId: string): Promise<number> {
  const result = await prisma.postView.count({
    where: { postId },
  });
  return result;
}

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
    author: post.author,
  };
}

/** Les 5 dernières publications, pour le carrousel héro */
export async function getFeaturedPosts(limit = 5): Promise<HomePostCard[]> {
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return Promise.all(posts.map(transformPostCard));
}

/** Toutes les publications récentes, pour la grille */
export async function getPublishedPosts(limit = 40): Promise<HomePostCard[]> {
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  return Promise.all(posts.map(transformPostCard));
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