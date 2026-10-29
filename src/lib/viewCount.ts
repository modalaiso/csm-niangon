import { MIN_POST_VIEW_SECONDS } from "@/lib/post-view-tracking";
import { prisma } from "@/lib/prisma";

export async function getPostViewCount(postId: string): Promise<number> {
  return prisma.postView.count({
    where: {
      postId,
      durationSeconds: { gte: MIN_POST_VIEW_SECONDS },
    },
  });
}
