import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const schoolClassFindMany = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    schoolClass: {
      findMany: schoolClassFindMany,
      findUnique: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => getUserMock() },
  }),
}));

const { getSchoolClasses, createClass } = await import(
  "@/app/actions/schedules"
);

describe("getSchoolClasses", () => {
  beforeEach(() => {
    schoolClassFindMany.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns classes ordered by level then name", async () => {
    schoolClassFindMany.mockResolvedValue([
      { id: "1", name: "6e A", level: "Sixième", schoolYear: "2026-2027" },
    ]);
    const classes = await getSchoolClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].name).toBe("6e A");
    expect(schoolClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ level: "asc" }, { name: "asc" }],
      }),
    );
  });

  it("returns an empty array on a database error rather than throwing", async () => {
    schoolClassFindMany.mockRejectedValue(new Error("db error"));
    await expect(getSchoolClasses()).resolves.toEqual([]);
  });
});

describe("createClass authorization", () => {
  beforeEach(() => getUserMock.mockReset());

  it("rejects unauthenticated visitors", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const result = await createClass("6e B", "Sixième", "2026-2027");
    expect(result).toEqual({ error: "auth_required" });
  });
});
