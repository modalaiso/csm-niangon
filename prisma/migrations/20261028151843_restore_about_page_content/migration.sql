CREATE TABLE IF NOT EXISTS "AboutPageContent" (
    "id" VARCHAR(20) NOT NULL DEFAULT 'main',
    "eyebrow" VARCHAR(60) NOT NULL DEFAULT 'CSM NIANGON',
    "title" VARCHAR(120) NOT NULL DEFAULT 'Grandir, apprendre et réussir ensemble',
    "subtitle" VARCHAR(400) NOT NULL DEFAULT 'Bienvenue sur la plateforme communautaire du CSM Niangon. Retrouvez les actualités, les informations et les ressources qui font vivre notre communauté scolaire.',
    "missionTitle" VARCHAR(100) NOT NULL DEFAULT 'Faire vivre la communauté',
    "missionText" TEXT NOT NULL DEFAULT 'Rassembler élèves, familles et équipe éducative autour d’un espace d’information simple, utile et accessible à tous.

La plateforme facilite le partage des actualités, des annonces et des ressources du CSM Niangon.',
    "visionTitle" VARCHAR(100) NOT NULL DEFAULT 'Une école qui avance ensemble',
    "visionText" TEXT NOT NULL DEFAULT 'Encourager la curiosité, l’entraide et l’engagement de chacun, pour accompagner les élèves dans leur parcours et célébrer leurs réussites.',
    "valuesTitle" VARCHAR(100) NOT NULL DEFAULT 'Nos valeurs',
    "valuesText" TEXT NOT NULL DEFAULT 'L’excellence, notre devise.
La solidarité, pour progresser ensemble.
L’engagement, au service de la réussite des enfants.',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AboutPageContent_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AboutPageContent" ("id") VALUES ('main')
ON CONFLICT ("id") DO NOTHING;
