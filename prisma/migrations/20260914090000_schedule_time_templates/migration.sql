CREATE TABLE "ScheduleTimeTemplate" (
    "id" TEXT NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScheduleTimeTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScheduleTimeTemplate_schoolYear_position_idx" ON "ScheduleTimeTemplate"("schoolYear", "position");
CREATE UNIQUE INDEX "ScheduleTimeTemplate_schoolYear_startTime_endTime_key" ON "ScheduleTimeTemplate"("schoolYear", "startTime", "endTime");
