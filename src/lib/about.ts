import { z } from "zod";

export const ABOUT_ICONS = [
  "church",
  "lightbulb",
  "star",
  "heart",
  "book",
  "users",
  "shield",
  "trophy",
] as const;
export type AboutIconName = (typeof ABOUT_ICONS)[number];

export const ABOUT_ICON_LABELS: Record<AboutIconName, string> = {
  church: "Foi",
  lightbulb: "Idée / Savoir",
  star: "Étoile / Excellence",
  heart: "Cœur",
  book: "Livre",
  users: "Communauté",
  shield: "Discipline",
  trophy: "Trophée",
};

const text = (max = 2000) => z.string().trim().max(max);
const link = z.string().trim().max(500);

export const aboutSchema = z.object({
  hero: z.object({
    eyebrow: text(120),
    title: text(160),
    subtitle: text(300),
    image: link,
    ctaLabel: text(60),
    ctaHref: link,
  }),
  stats: z.array(z.object({ value: text(20), label: text(60) })).max(6),
  presentation: z.object({
    eyebrow: text(120),
    title: text(160),
    body: text(6000), // Markdown
    image: link,
  }),
  director: z.object({
    name: text(120),
    role: text(120),
    photo: link,
    message: text(3000), // Markdown
  }),
  values: z
    .array(
      z.object({
        title: text(60),
        description: text(600),
        icon: z.enum(ABOUT_ICONS),
      }),
    )
    .max(6),
  team: z
    .array(z.object({ name: text(120), role: text(120), photo: link }))
    .max(12),
  hours: z.array(z.object({ label: text(80), value: text(80) })).max(8),
  partners: z
    .array(z.object({ name: text(80), url: link, logo: link }))
    .max(12),
  contact: z.object({
    phone: text(60),
    email: text(120),
    address: text(200),
    mapUrl: link,
  }),
});

export type AboutContent = z.infer<typeof aboutSchema>;

export const DEFAULT_ABOUT: AboutContent = {
  hero: {
    eyebrow: "À propos de nous",
    title: "CSM Niangon",
    subtitle: "L'excellence, notre devise. Dieu pour la réussite des enfants.",
    image: "/bg.png",
    ctaLabel: "Nous contacter",
    ctaHref: "#contact",
  },
  stats: [
    { value: "100", label: "Ans d'histoire" },
    { value: "0", label: "Élèves" },
    { value: "0", label: "Enseignants" },
    { value: "0%", label: "Réussite aux examens" },
  ],
  presentation: {
    eyebrow: "Notre établissement",
    title: "Présentation du CSM Niangon",
    body: "Présentez ici l'histoire, la mission et le cadre de l'établissement.\n\n**Astuce :** vous pouvez utiliser le Markdown (gras, listes, liens).",
    image: "/miniature.png",
  },
  director: {
    name: "Nom du directeur",
    role: "Directeur",
    photo: "",
    message: "Le mot du directeur s'affichera ici.",
  },
  values: [
    {
      title: "Foi",
      description: "Notre identité chrétienne guide chacune de nos actions.",
      icon: "church",
    },
    {
      title: "Savoir",
      description: "Transmettre le savoir, le savoir-être et le savoir-faire.",
      icon: "lightbulb",
    },
    {
      title: "Excellence",
      description: "Viser le meilleur pour la réussite de chaque enfant.",
      icon: "star",
    },
  ],
  team: [],
  hours: [
    { label: "Lundi - Vendredi", value: "07h30 - 17h00" },
    { label: "Samedi", value: "Fermé" },
  ],
  partners: [],
  contact: {
    phone: "",
    email: "contact@csm-niangon.com",
    address: "Abidjan, Yopougon Niangon",
    mapUrl: "https://maps.app.goo.gl/7maChM65BqTMFoLG6",
  },
};