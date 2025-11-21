import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    const keys = [
        // Moderators
        { key: 'CSM-N-TV-MOD-2025-7K9M-XP4R-QW8N', role: Role.MODERATOR },
        { key: 'CSM-N-TV-MOD-2025-5H2L-ZV6T-BN9Y', role: Role.MODERATOR },
        { key: 'CSM-N-TV-MOD-2025-3F8J-CR7M-DK4P', role: Role.MODERATOR },

        // Writers
        { key: 'CSM-N-TV-WRITER-2025-9R5N-MT8K-LP3X', role: Role.WRITER },
        { key: 'CSM-N-TV-WRITER-2025-6Q2H-YV9F-ZJ7W', role: Role.WRITER },
        { key: 'CSM-N-TV-WRITER-2025-4D8B-GN6R-XM2K', role: Role.WRITER },

        // Admins
        { key: 'CSM-N-TV-ADMIN-2025-8X3P-QK9V-HR6L', role: Role.ADMIN },
        { key: 'CSM-N-TV-ADMIN-2025-2M7J-WF5N-CT4Y', role: Role.ADMIN },
        { key: 'CSM-N-TV-ADMIN-2025-5Z9R-BV3K-DP8X', role: Role.ADMIN },
    ]

    for (const k of keys) {
        const exists = await prisma.accessKey.findUnique({
            where: { key: k.key }
        })

        if (!exists) {
            await prisma.accessKey.create({
                data: {
                    key: k.key,
                    role: k.role,
                    isUsed: false,
                }
            })
            console.log(`Created key for ${k.role}: ${k.key}`)
        } else {
            console.log(`Key already exists: ${k.key}`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
