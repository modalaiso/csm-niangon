"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

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

const cardSelect = {
  id: true,
  type: true,
  title: true,
  slug: true,
  summary: true,
  thumbnail: true,
  views: true,
  publishedAt: true,
  author: { select: { username: true } },
} as const;

/** Les 5 dernières publications, pour le carrousel héro */
export async function getFeaturedPosts(limit = 5): Promise<HomePostCard[]> {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}

/** Toutes les publications récentes, pour la grille */
export async function getPublishedPosts(limit = 40): Promise<HomePostCard[]> {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}