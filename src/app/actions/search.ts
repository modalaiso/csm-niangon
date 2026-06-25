"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string | null;
  type: string;
  author: {
    id: string;
    username: string;
  };
  publishedAt: Date | null;
}

/**
 * Search posts by query (title, slug, summary, info)
 * Only returns PUBLISHED posts
 */
export async function searchPosts(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const results = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            summary: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            info: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
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
          },
        },
        publishedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return results;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}

/**
 * Get recent published posts
 */
export async function getRecentPosts(limit: number = 10): Promise<SearchResult[]> {
  try {
    const results = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      select: {
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
          },
        },
        publishedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return results;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}

/**
 * Get full search results (for the search results page)
 */
export async function getSearchResults(
  query: string,
  limit: number = 50
): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return getRecentPosts(limit);
  }

  return searchPosts(query, limit);
}
