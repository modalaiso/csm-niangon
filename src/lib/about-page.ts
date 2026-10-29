import "server-only";

import { prisma } from "@/lib/prisma";

export const ABOUT_PAGE_CONTENT_ID = "main";

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
}

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  eyebrow: "CSM NIANGON",
  title: "Grandir, apprendre et réussir ensemble",
  subtitle:
    "Bienvenue sur la plateforme communautaire du CSM Niangon. Retrouvez les actualités, les informations et les ressources qui font vivre notre communauté scolaire.",
  missionTitle: "Faire vivre la communauté",
  missionText:
    "Rassembler élèves, familles et équipe éducative autour d’un espace d’information simple, utile et accessible à tous.\n\nLa plateforme facilite le partage des actualités, des annonces et des ressources du CSM Niangon.",
  visionTitle: "Une école qui avance ensemble",
  visionText:
    "Encourager la curiosité, l’entraide et l’engagement de chacun, pour accompagner les élèves dans leur parcours et célébrer leurs réussites.",
  valuesTitle: "Nos valeurs",
  valuesText:
    "L’excellence, notre devise.\nLa solidarité, pour progresser ensemble.\nL’engagement, au service de la réussite des enfants.",
};

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const content = await prisma.aboutPageContent.findUnique({
    where: { id: ABOUT_PAGE_CONTENT_ID },
    select: {
      eyebrow: true,
      title: true,
      subtitle: true,
      missionTitle: true,
      missionText: true,
      visionTitle: true,
      visionText: true,
      valuesTitle: true,
      valuesText: true,
    },
  });

  return content ?? DEFAULT_ABOUT_PAGE_CONTENT;
}
