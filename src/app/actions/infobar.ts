"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus, PostType } from "@prisma/client";

export interface InfoBarItem {
  id: string;
  title: string;
  slug: string;
  isUrgent: boolean;
  publishedAt: Date | null;
}

const URGENT_TAG = "urgent";

/**
 * Récupère les posts de type INFO publiés, pour la barre d'information.
 * Un post est "urgent" s'il possède le tag "urgent" (insensible à la casse).
 * Les items urgents sont toujours affichés en premier.
 */
export async function getInfoBarItems(limit: number = 15): Promise<InfoBarItem[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        type: PostType.INFO,
        status: PostStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    const items: InfoBarItem[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      isUrgent: post.tags.some((t) => t.toLowerCase() === URGENT_TAG),
      publishedAt: post.publishedAt,
    }));

    // Urgent en premier, puis le reste par date décroissante (déjà trié)
    return items.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
  } catch (error) {
    console.error("Erreur lors du chargement de la barre d'information:", error);
    return [];
  }
}