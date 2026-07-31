import { PrismaClient, ModerationAction, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Helper to get keys from env
  const getKeys = (envVar: string) => {
    const keys =
      process.env[envVar]
        ?.split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0) || [];
    if (keys.length === 0) {
      console.warn(`Warning: No keys found for ${envVar}`);
    }
    return keys;
  };

  const moderatorKeys = getKeys("MODERATOR_KEYS");
  const writerKeys = getKeys("WRITER_KEYS");
  const adminKeys = getKeys("ADMIN_KEYS");

  const keys = [
    ...moderatorKeys.map((key) => ({ key, role: Role.MODERATOR })),
    ...writerKeys.map((key) => ({ key, role: Role.WRITER })),
    ...adminKeys.map((key) => ({ key, role: Role.ADMIN })),
  ];

  for (const k of keys) {
    const exists = await prisma.accessKey.findUnique({
      where: { key: k.key },
    });

    if (!exists) {
      await prisma.accessKey.create({
        data: {
          key: k.key,
          role: k.role,
          isUsed: false,
        },
      });
      console.log(`Created key for ${k.role}: ${k.key}`);
    } else {
      console.log(`Key already exists: ${k.key}`);
    }
  }

  const keywords: { phrase: string; action: ModerationAction }[] = [
    { phrase: "con", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "connard", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "connasse", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "idiot", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "imbécile", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "abruti", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "crétin", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "débile", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "stupide", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "nul", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "sale type", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "sale fille", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "sale chien", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "espèce de", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "ferme ta gueule", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "ta gueule", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "va te faire voir", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "va te faire foutre", action: ModerationAction.AUTO_DELETE },
    { phrase: "fdp", action: ModerationAction.AUTO_DELETE },
    { phrase: "tg", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "ntm", action: ModerationAction.AUTO_DELETE },
    { phrase: "nique ta mère", action: ModerationAction.AUTO_DELETE },
    { phrase: "enculé", action: ModerationAction.AUTO_DELETE },
    { phrase: "enculé de", action: ModerationAction.AUTO_DELETE },
    { phrase: "pute", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "salope", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "bâtard", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "fils de pute", action: ModerationAction.AUTO_DELETE },

    // ===== HARCÈLEMENT =====
    { phrase: "tu ne sers à rien", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "personne ne t'aime", action: ModerationAction.AUTO_DELETE },
    { phrase: "tu devrais disparaître", action: ModerationAction.AUTO_DELETE },
    { phrase: "on te déteste", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "va mourir", action: ModerationAction.AUTO_DELETE },
    { phrase: "dégage", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "casse-toi", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "tu es inutile", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "honte à toi", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "tu fais pitié", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== DISCRIMINATION =====
    { phrase: "sale noir", action: ModerationAction.AUTO_DELETE },
    { phrase: "sale blanc", action: ModerationAction.AUTO_DELETE },
    { phrase: "sale arabe", action: ModerationAction.AUTO_DELETE },
    { phrase: "sale asiatique", action: ModerationAction.AUTO_DELETE },
    { phrase: "sale étranger", action: ModerationAction.AUTO_DELETE },
    { phrase: "retourne dans ton pays", action: ModerationAction.AUTO_DELETE },
    { phrase: "raciste", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "esclave", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "singe", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== VULGARITÉ =====
    { phrase: "merde", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "putain", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "bordel", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "chiotte", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "bite", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "queue", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "chatte", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "couilles", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "cul", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "nique", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "baise", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "baiser", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "branleur", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "branle", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== SPAM =====
    { phrase: "abonne-toi", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "gagne de l'argent", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "argent facile", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "travail à domicile", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "clique ici", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "lien en bio", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "whatsapp", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "telegram", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "investis maintenant", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "100% garanti", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "casino", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "pari sportif", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "https://", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "http://", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "www.", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "bit.ly", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "t.me", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "wa.me", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== MENACES =====
    { phrase: "je vais te tuer", action: ModerationAction.AUTO_DELETE },
    { phrase: "je vais venir", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "on va te retrouver", action: ModerationAction.AUTO_DELETE },
    { phrase: "je connais chez toi", action: ModerationAction.AUTO_DELETE },
    { phrase: "tu vas payer", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "attends-moi dehors", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== ARNAQUES =====
    { phrase: "orange money", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "wave", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "mtn money", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "moov money", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "envoie-moi", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "transfert", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "paiement", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "bitcoin garanti", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "crypto garantie", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "double ton argent", action: ModerationAction.AUTO_DELETE },

    // ===== VARIANTES =====
    { phrase: "c0n", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "c*n", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "c.o.n", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "p*te", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "p.u.t.e", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "f d p", action: ModerationAction.AUTO_DELETE },
    { phrase: "f.d.p", action: ModerationAction.AUTO_DELETE },
    { phrase: "n1que", action: ModerationAction.AUTO_DELETE },
    { phrase: "n!que", action: ModerationAction.AUTO_DELETE },
    { phrase: "merd3", action: ModerationAction.FLAG_FOR_REVIEW },

    // ===== TERMES À MODÉRER (PAS À SUPPRIMER) =====
    { phrase: "sexe", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "drogue", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "alcool", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "violence", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "suicide", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "mort", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "arme", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "couteau", action: ModerationAction.FLAG_FOR_REVIEW },
    { phrase: "sang", action: ModerationAction.FLAG_FOR_REVIEW },
  ];

  for (const item of keywords) {
    await prisma.moderationKeyword.upsert({
      where: { phrase: item.phrase },
      update: { action: item.action },
      create: {
        phrase: item.phrase,
        action: item.action,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${keywords.length} moderation keywords.`);
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });