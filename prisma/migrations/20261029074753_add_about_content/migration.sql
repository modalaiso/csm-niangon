-- AlterTable
ALTER TABLE "AboutPageContent" ALTER COLUMN "missionText" SET DEFAULT 'Rassembler élèves, familles et équipe éducative autour d’un espace d’information simple, utile et accessible à tous.

La plateforme facilite le partage des actualités, des annonces et des ressources du CSM Niangon.',
ALTER COLUMN "valuesText" SET DEFAULT 'L’excellence, notre devise.
La solidarité, pour progresser ensemble.
L’engagement, au service de la réussite des enfants.',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);
