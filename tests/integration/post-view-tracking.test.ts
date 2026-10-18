import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPost: vi.fn(),
  findView: vi.fn(),
  createView: vi.fn(),
  updateView: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { findFirst: mocks.findPost },
    postView: {
      findFirst: mocks.findView,
      create: mocks.createView,
      update: mocks.updateView,
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

const { POST } = await import("@/app/api/posts/[id]/view/route");

function makeRequest(durationSeconds: number) {
  return new Request("https://example.test/api/posts/post-id/view", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.17",
    },
    body: JSON.stringify({ durationSeconds }),
  });
}

const routeContext = {
  params: Promise.resolve({ id: "post-id" }),
};

describe("POST /api/posts/[id]/view", () => {
  beforeEach(() => {
    mocks.findPost.mockReset().mockResolvedValue({ id: "post-id" });
    mocks.findView.mockReset().mockResolvedValue(null);
    mocks.createView.mockReset().mockResolvedValue({});
    mocks.updateView.mockReset().mockResolvedValue({});
  });

  it("rejects a read shorter than the qualification threshold", async () => {
    const response = await POST(makeRequest(9), routeContext);

    expect(response.status).toBe(400);
    expect(mocks.findPost).not.toHaveBeenCalled();
    expect(mocks.createView).not.toHaveBeenCalled();
  });

  it("rejects a JSON null payload without touching the database", async () => {
    const response = await POST(
      new Request("https://example.test/api/posts/post-id/view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "null",
      }),
      routeContext,
    );

    expect(response.status).toBe(400);
    expect(mocks.findPost).not.toHaveBeenCalled();
  });

  it("stores a qualified anonymous read and its active duration", async () => {
    const response = await POST(makeRequest(37), routeContext);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      success: true,
      qualified: true,
    });
    expect(mocks.createView).toHaveBeenCalledWith({
      data: {
        postId: "post-id",
        ipAddress: "198.51.100.17",
        userId: null,
        durationSeconds: 37,
      },
    });
  });

  it("updates the existing unique view when the visitor reads longer", async () => {
    mocks.findView.mockResolvedValue({
      id: "view-id",
      durationSeconds: 10,
    });

    const response = await POST(makeRequest(45), routeContext);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      qualified: false,
    });
    expect(mocks.updateView).toHaveBeenCalledWith({
      where: { id: "view-id" },
      data: { durationSeconds: 45 },
    });
    expect(mocks.createView).not.toHaveBeenCalled();
  });

  it("qualifies a legacy view once its active reading time reaches 10 seconds", async () => {
    mocks.findView.mockResolvedValue({
      id: "view-id",
      durationSeconds: 0,
    });

    const response = await POST(makeRequest(10), routeContext);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      qualified: true,
    });
    expect(mocks.updateView).toHaveBeenCalledWith({
      where: { id: "view-id" },
      data: { durationSeconds: 10 },
    });
  });

  it("does not shorten a previously recorded read", async () => {
    mocks.findView.mockResolvedValue({
      id: "view-id",
      durationSeconds: 45,
    });

    const response = await POST(makeRequest(20), routeContext);

    expect(response.status).toBe(200);
    expect(mocks.updateView).not.toHaveBeenCalled();
    expect(mocks.createView).not.toHaveBeenCalled();
  });
});
