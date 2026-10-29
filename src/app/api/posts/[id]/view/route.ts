import { PostStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  MAX_POST_VIEW_SECONDS,
  MIN_POST_VIEW_SECONDS,
} from "@/lib/post-view-tracking";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getBoundedDuration(request: Request): Promise<number | null> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return null;
  }

  const durationSeconds =
    typeof payload === "object" &&
    payload !== null &&
    "durationSeconds" in payload
      ? payload.durationSeconds
      : undefined;
  if (
    typeof durationSeconds !== "number" ||
    !Number.isSafeInteger(durationSeconds) ||
    durationSeconds < MIN_POST_VIEW_SECONDS
  ) {
    return null;
  }
  return Math.min(durationSeconds, MAX_POST_VIEW_SECONDS);
}

function getIpAddress(request: Request): string {
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return (
    request.headers.get("x-real-ip")?.trim() ||
    forwardedAddress ||
    "unknown"
  ).slice(0, 64);
}

async function saveView(
  postId: string,
  userId: string | undefined,
  ipAddress: string,
  durationSeconds: number,
) {
  const existingView = await prisma.postView.findFirst({
    where: userId
      ? { postId, OR: [{ userId }, { ipAddress }] }
      : { postId, ipAddress },
    select: { id: true, durationSeconds: true },
  });

  if (existingView) {
    const qualified =
      existingView.durationSeconds < MIN_POST_VIEW_SECONDS &&
      durationSeconds >= MIN_POST_VIEW_SECONDS;
    if (durationSeconds > existingView.durationSeconds) {
      await prisma.postView.update({
        where: { id: existingView.id },
        data: { durationSeconds },
      });
    }
    return { success: true, qualified };
  }

  await prisma.postView.create({
    data: {
      postId,
      userId: userId ?? null,
      ipAddress: userId ? null : ipAddress,
      durationSeconds,
    },
  });
  return { success: true, qualified: true, status: 201 };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id || id.length > 128) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const durationSeconds = await getBoundedDuration(request);
  if (durationSeconds === null) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findFirst({
      where: { id, status: PostStatus.PUBLISHED },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const result = await saveView(
      post.id,
      user?.id,
      getIpAddress(request),
      durationSeconds,
    );
    const { status, ...body } = result;
    return NextResponse.json(body, status ? { status } : undefined);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ success: true, qualified: false });
    }
    console.error(
      "Erreur lors de l'enregistrement de la durée de lecture:",
      error,
    );
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
