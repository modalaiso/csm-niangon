import { PrismaClient, Role } from "@prisma/client";

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
