"use server";

import { PostStatus, PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPostViewCount } from "@/lib/viewCount";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string | null;
  type: string;
  views: number;
  author: {
    id: string;
    username?: string;
    prenom?: string;
    nom?: string;
  };
  publishedAt: Date | null;
}

const resultSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  thumbnail: true,
  type: true,
  author: {
    select: {
      id: true,
      username: true,
      prenom: true,
      nom: true,
    },
  },
  publishedAt: true,
} as const;

/**
 * Search posts by query (title, slug, summary, info)
 * Only returns PUBLISHED posts — les ANNONCE ne sont jamais indexées :
 * elles ne s'affichent qu'en pop-up, pas dans les résultats de recherche.
 */
export async function searchPosts(
  query: string,
  limit: number = 10,
  offset: number = 0,
): Promise<{ results: SearchResult[]; total: number }> {
  if (!query || query.trim().length === 0) {
    return { results: [], total: 0 };
  }

  try {
    const where = {
      status: PostStatus.PUBLISHED,
      type: { not: PostType.ANNONCE },
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { slug: { contains: query, mode: "insensitive" as const } },
        { summary: { contains: query, mode: "insensitive" as const } },
        { info: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [rawResults, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: resultSelect,
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const results = await Promise.all(
      rawResults.map(async (r: any) => ({
        ...r,
        views: await getPostViewCount(r.id),
      })),
    );

    return { results, total };
  } catch (error) {
    console.error("Error searching posts:", error);
    return { results: [], total: 0 };
  }
}

/**
 * Get recent published posts — hors ANNONCE, également non indexées ici
 * (barre de recherche "posts récents").
 */
export async function getRecentPosts(
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    const results = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, type: { not: PostType.ANNONCE } },
      select: resultSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    const mapped = await Promise.all(
      results.map(async (r: any) => ({
        ...r,
        views: await getPostViewCount(r.id),
      })),
    );

    return mapped;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}

/**
 * Get full search results (for the search results page), with pagination
 */
export async function getSearchResults(
  query: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ results: SearchResult[]; total: number }> {
  if (!query || query.trim().length === 0) {
    const results = await getRecentPosts(limit);
    return { results, total: results.length };
  }

  return searchPosts(query, limit, offset);
}
