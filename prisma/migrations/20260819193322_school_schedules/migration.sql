-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI');

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "schoolYear" TEXT NOT NULL DEFAULT '2026-2027',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleRow" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleCell" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "day" "Weekday" NOT NULL,
    "subjectId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_name_key" ON "SchoolClass"("name");

-- CreateIndex
CREATE INDEX "SchoolClass_level_idx" ON "SchoolClass"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "ScheduleRow_classId_idx" ON "ScheduleRow"("classId");

-- CreateIndex
CREATE INDEX "ScheduleCell_rowId_idx" ON "ScheduleCell"("rowId");

-- CreateIndex
CREATE INDEX "ScheduleCell_subjectId_idx" ON "ScheduleCell"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleCell_rowId_day_key" ON "ScheduleCell"("rowId", "day");

-- AddForeignKey
ALTER TABLE "ScheduleRow" ADD CONSTRAINT "ScheduleRow_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleCell" ADD CONSTRAINT "ScheduleCell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "ScheduleRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleCell" ADD CONSTRAINT "ScheduleCell_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
