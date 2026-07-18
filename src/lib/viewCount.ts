import { prisma } from "@/lib/prisma";

export async function getPostViewCount(postId: string): Promise<number> {
  return prisma.postView.count({ where: { postId } });
}
