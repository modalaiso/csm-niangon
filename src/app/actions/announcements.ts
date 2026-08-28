"use server";

import { PostStatus, PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AnnouncementItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  thumbnail: string | null;
  mediaUrl: string | null;
  publishedAt: Date | null;
  expiresAt: Date | null;
}

/**
 * Récupère les annonces actives : type ANNONCE, publiées, et dont la durée
 * de vie n'est pas dépassée (expiresAt null = pas de limite, ou dans le futur).
 * Utilisé pour le pop-up à l'arrivée sur le site et pour la barre d'info.
 */
export async function getActiveAnnouncements(
  limit: number = 10,
): Promise<AnnouncementItem[]> {
  try {
    const now = new Date();
    const posts = await prisma.post.findMany({
      where: {
        type: PostType.ANNONCE,
        status: PostStatus.PUBLISHED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        thumbnail: true,
        mediaUrl: true,
        publishedAt: true,
        expiresAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    return posts;
  } catch (error) {
    console.error("Erreur lors du chargement des annonces:", error);
    return [];
  }
}
