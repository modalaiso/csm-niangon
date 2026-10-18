import { PostStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  MAX_POST_VIEW_SECONDS,
  MIN_POST_VIEW_SECONDS,
} from "@/lib/post-view-tracking";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id || id.length > 128) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
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
    const forwardedAddress = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim();
    const ipAddress = (
      request.headers.get("x-real-ip")?.trim() ||
      forwardedAddress ||
      "unknown"
    ).slice(0, 64);
    const identity = user
      ? { postId: post.id, userId: user.id }
      : { postId: post.id, ipAddress };
    const existingViewWhere = user
      ? { postId: post.id, OR: [{ userId: user.id }, { ipAddress }] }
      : { postId: post.id, ipAddress };
    const boundedDuration = Math.min(durationSeconds, MAX_POST_VIEW_SECONDS);

    const existingView = await prisma.postView.findFirst({
      where: existingViewWhere,
      select: { id: true, durationSeconds: true },
    });

    if (existingView) {
      const newlyQualified =
        existingView.durationSeconds < MIN_POST_VIEW_SECONDS &&
        boundedDuration >= MIN_POST_VIEW_SECONDS;
      if (boundedDuration > existingView.durationSeconds) {
        await prisma.postView.update({
          where: { id: existingView.id },
          data: { durationSeconds: boundedDuration },
        });
      }
      return NextResponse.json({ success: true, qualified: newlyQualified });
    }

    await prisma.postView.create({
      data: {
        ...identity,
        userId: user?.id ?? null,
        ipAddress: user ? null : ipAddress,
        durationSeconds: boundedDuration,
      },
    });
    return NextResponse.json(
      { success: true, qualified: true },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ success: true, qualified: false });
    }
    console.error(
      "Erreur lors de l'enregistrement de la durée de lecture:",
      error,
    );
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
