"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { type AboutContent, aboutSchema, DEFAULT_ABOUT } from "@/lib/about";
import { getPostManagerAuthContext } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";

const ID = "singleton";

/** Contenu public de la page /about (retombe sur les valeurs par défaut) */
export async function getAboutContent(): Promise<AboutContent> {
  try {
    const row = await prisma.aboutContent.findUnique({ where: { id: ID } });
    if (!row) return DEFAULT_ABOUT;
    const parsed = aboutSchema.safeParse(row.data);
    return parsed.success ? parsed.data : DEFAULT_ABOUT;
  } catch (error) {
    console.error("Erreur lors du chargement de la page À propos:", error);
    return DEFAULT_ABOUT;
  }
}

type SaveResult =
  | { success: true }
  | { error: "auth_required" | "forbidden" | "invalid" | "unknown" };

export async function saveAboutContent(input: unknown): Promise<SaveResult> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };

  try {
    const data = parsed.data as unknown as Prisma.InputJsonValue;
    await prisma.aboutContent.upsert({
      where: { id: ID },
      create: { id: ID, data },
      update: { data },
    });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "UPDATE_ABOUT",
        targetType: "AboutPage",
        targetId: ID,
      },
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement de la page À propos:",
      error,
    );
    return { error: "unknown" };
  }
}
