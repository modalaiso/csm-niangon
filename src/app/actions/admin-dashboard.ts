"use server";

import { prisma } from "@/lib/prisma";
import { PostStatus, PostType } from "@prisma/client";
import { getAdminAuthContext } from "@/lib/auth/admin-guard";

export interface DashboardSummary {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  pendingComments: number;
  totalComments: number;
  activeAnnouncements: number;
  totalUsers: number;
}

type DashboardSummaryResult = DashboardSummary | { error: "auth_required" | "forbidden" };

/** Résumé de la plateforme pour les cartes KPI de la vue d'ensemble */
export async function getDashboardSummary(): Promise<DashboardSummaryResult> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  try {
    const now = new Date();
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      pendingComments,
      totalComments,
      activeAnnouncements,
      totalUsers,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { status: PostStatus.DRAFT } }),
      prisma.post.count({ where: { status: PostStatus.ARCHIVED } }),
      prisma.comment.count({ where: { isFlagged: true } }),
      prisma.comment.count(),
      prisma.post.count({
        where: {
          type: PostType.ANNONCE,
          status: PostStatus.PUBLISHED,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.user.count(),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      pendingComments,
      totalComments,
      activeAnnouncements,
      totalUsers,
    };
  } catch (error) {
    console.error("Erreur lors du chargement du résumé dashboard:", error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      archivedPosts: 0,
      pendingComments: 0,
      totalComments: 0,
      activeAnnouncements: 0,
      totalUsers: 0,
    };
  }
}