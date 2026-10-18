import { beforeEach, describe, expect, it, vi } from "vitest";

const postViewCount = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    postView: {
      count: postViewCount,
    },
  },
}));

const { getPostViewCount } = await import("@/lib/viewCount");

describe("getPostViewCount", () => {
  beforeEach(() => {
    postViewCount.mockReset();
  });

  it("counts only views that passed the active-reading threshold", async () => {
    postViewCount.mockResolvedValue(4);

    await expect(getPostViewCount("post-id")).resolves.toBe(4);
    expect(postViewCount).toHaveBeenCalledWith({
      where: {
        postId: "post-id",
        durationSeconds: { gte: 10 },
      },
    });
  });
});
