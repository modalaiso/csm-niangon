"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ABOUT_PAGE_CONTENT_ID } from "@/lib/about-page";
import { getAdminAuthContext } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";

const aboutPageSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().min(1).max(400),
  missionTitle: z.string().trim().min(1).max(100),
  missionText: z.string().trim().min(1).max(5000),
  visionTitle: z.string().trim().min(1).max(100),
  visionText: z.string().trim().min(1).max(5000),
  valuesTitle: z.string().trim().min(1).max(100),
  valuesText: z.string().trim().min(1).max(5000),
});

export interface SaveAboutPageState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function saveAboutPageContent(
  _previousState: SaveAboutPageState,
  formData: FormData,
): Promise<SaveAboutPageState> {
  const auth = await getAdminAuthContext();
  if (!auth.ok) {
    return {
      status: "error",
      message:
        auth.error === "auth_required"
          ? "Connectez-vous avec un compte administrateur pour modifier cette page."
          : "Vous n’avez pas l’autorisation de modifier cette page.",
    };
  }

  const parsed = aboutPageSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    missionTitle: formData.get("missionTitle"),
    missionText: formData.get("missionText"),
    visionTitle: formData.get("visionTitle"),
    visionText: formData.get("visionText"),
    valuesTitle: formData.get("valuesTitle"),
    valuesText: formData.get("valuesText"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Vérifiez les champs : ils doivent être remplis et respecter la longueur maximale indiquée.",
    };
  }

  try {
    await prisma.aboutPageContent.upsert({
      where: { id: ABOUT_PAGE_CONTENT_ID },
      create: { id: ABOUT_PAGE_CONTENT_ID, ...parsed.data },
      update: parsed.data,
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return {
      status: "success",
      message: "La page À propos a été mise à jour.",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la page À propos :", error);
    return {
      status: "error",
      message:
        "La page n’a pas pu être enregistrée. Réessayez dans quelques instants.",
    };
  }
}
