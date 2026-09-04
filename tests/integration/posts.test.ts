import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: postFindMany,
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

vi.mock("@/lib/viewCount", () => ({
  getPostViewCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

const { getPostTagsByType } = await import("@/app/actions/posts");
const { PostType } = await import("@prisma/client");

describe("getPostTagsByType", () => {
  beforeEach(() => {
    postFindMany.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns a deduplicated, alphabetically sorted list of tags", async () => {
    postFindMany.mockResolvedValue([
      { tags: ["sport", "Terminale"] },
      { tags: ["sport", "coupe"] },
    ]);
    const tags = await getPostTagsByType(PostType.ACTU);
    expect(tags).toEqual(["coupe", "sport", "Terminale"]);
  });

  it("ignores blank tags", async () => {
    postFindMany.mockResolvedValue([{ tags: ["  ", "actualite"] }]);
    const tags = await getPostTagsByType(PostType.ACTU);
    expect(tags).toEqual(["actualite"]);
  });

  it("returns an empty array when there are no posts", async () => {
    postFindMany.mockResolvedValue([]);
    const tags = await getPostTagsByType(PostType.ACTU);
    expect(tags).toEqual([]);
  });

  it("fails safe on database errors", async () => {
    postFindMany.mockRejectedValue(new Error("db down"));
    await expect(getPostTagsByType(PostType.ACTU)).resolves.toEqual([]);
  });
});
