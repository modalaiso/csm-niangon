import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    moderationKeyword: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

const { checkContentAgainstKeywords } = await import(
  "@/app/actions/moderation"
);

describe("checkContentAgainstKeywords", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns null when no active keyword matches", async () => {
    findManyMock.mockResolvedValue([
      { phrase: "spam", action: "AUTO_DELETE" },
    ]);
    const result = await checkContentAgainstKeywords("Bonjour tout le monde");
    expect(result).toBeNull();
  });

  it("matches case-insensitively", async () => {
    findManyMock.mockResolvedValue([
      { phrase: "insulte", action: "FLAG_FOR_REVIEW" },
    ]);
    const result = await checkContentAgainstKeywords("Quelle INSULTE grave");
    expect(result).toEqual({ phrase: "insulte", action: "FLAG_FOR_REVIEW" });
  });

  it("returns the first matching keyword in list order", async () => {
    findManyMock.mockResolvedValue([
      { phrase: "spam", action: "AUTO_DELETE" },
      { phrase: "bonjour", action: "FLAG_FOR_REVIEW" },
    ]);
    const result = await checkContentAgainstKeywords(
      "bonjour, ceci n'est pas du spam",
    );
    expect(result?.phrase).toBe("spam");
  });

  it("only queries active keywords", async () => {
    findManyMock.mockResolvedValue([]);
    await checkContentAgainstKeywords("test");
    expect(findManyMock).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it("fails safe (returns null) on a database error", async () => {
    findManyMock.mockRejectedValue(new Error("db down"));
    const result = await checkContentAgainstKeywords("test");
    expect(result).toBeNull();
  });
});
