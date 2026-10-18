ALTER TABLE "SchoolClass"
ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "SchoolClass" AS school_class
SET "publishedAt" = CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1
  FROM "ScheduleRow" AS schedule_row
  JOIN "ScheduleCell" AS schedule_cell
    ON schedule_cell."rowId" = schedule_row."id"
  WHERE schedule_row."classId" = school_class."id"
    AND schedule_cell."subjectId" IS NOT NULL
);

ALTER TABLE "User"
ADD COLUMN "schoolClassId" TEXT;

CREATE INDEX "User_schoolClassId_idx" ON "User"("schoolClassId");

ALTER TABLE "User"
ADD CONSTRAINT "User_schoolClassId_fkey"
FOREIGN KEY ("schoolClassId") REFERENCES "SchoolClass"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
