"use server";

import { PostStatus, PostType } from "@prisma/client";
import { getDashboardAuthContext } from "@/lib/auth/admin-guard";
import { MIN_POST_VIEW_SECONDS } from "@/lib/post-view-tracking";
import { prisma } from "@/lib/prisma";

export interface DashboardSummary {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  pendingComments: number;
  totalComments: number;
  activeAnnouncements: number;
  totalUsers: number;
  qualifiedViews30Days: number;
  averagePostReadSeconds: number;
  topPosts: {
    id: string;
    title: string;
    type: string;
    views: number;
    averageReadSeconds: number;
  }[];
}

type DashboardSummaryResult =
  | DashboardSummary
  | { error: "auth_required" | "forbidden" };

/** Résumé de la plateforme pour les cartes KPI de la vue d'ensemble */
export async function getDashboardSummary(): Promise<DashboardSummaryResult> {
  const auth = await getDashboardAuthContext();
  if (!auth.ok) {
    return { error: auth.error };
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const qualifiedViewsWhere = {
      createdAt: { gte: thirtyDaysAgo },
      durationSeconds: { gte: MIN_POST_VIEW_SECONDS },
      post: { status: PostStatus.PUBLISHED },
    };
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      pendingComments,
      totalComments,
      activeAnnouncements,
      totalUsers,
      viewStats,
      topPostGroups,
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
      prisma.postView.aggregate({
        where: qualifiedViewsWhere,
        _count: { _all: true },
        _avg: { durationSeconds: true },
      }),
      prisma.postView.groupBy({
        by: ["postId"],
        where: qualifiedViewsWhere,
        _count: { postId: true },
        _avg: { durationSeconds: true },
        orderBy: { _count: { postId: "desc" } },
        take: 5,
      }),
    ]);

    const topPostDetails = await prisma.post.findMany({
      where: { id: { in: topPostGroups.map((post) => post.postId) } },
      select: { id: true, title: true, type: true },
    });
    const postDetailsById = new Map(
      topPostDetails.map((post) => [post.id, post]),
    );
    const topPosts = topPostGroups.flatMap((group) => {
      const post = postDetailsById.get(group.postId);
      if (!post) return [];
      return [
        {
          ...post,
          views: group._count.postId,
          averageReadSeconds: Math.round(group._avg.durationSeconds ?? 0),
        },
      ];
    });

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      pendingComments,
      totalComments,
      activeAnnouncements,
      totalUsers,
      qualifiedViews30Days: viewStats._count._all,
      averagePostReadSeconds: Math.round(viewStats._avg.durationSeconds ?? 0),
      topPosts,
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
      qualifiedViews30Days: 0,
      averagePostReadSeconds: 0,
      topPosts: [],
    };
  }
}
