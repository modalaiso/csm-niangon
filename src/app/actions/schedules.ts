"use server";

import { Prisma, type Weekday } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  getCurrentUser,
  getPostManagerAuthContext,
} from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import {
  isValidScheduleTimeRange,
  parseScheduleTime,
  scheduleTimesOverlap,
  WEEKDAYS,
} from "@/lib/schedules";

/* --------------------------------- Types --------------------------------- */

export interface ClassSummary {
  id: string;
  name: string;
  level: string | null;
  schoolYear: string;
  publishedAt: Date | null;
}

export interface ScheduleCellData {
  day: Weekday;
  subjectId: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  updatedAt: Date | null;
}

export interface ScheduleRowData {
  id: string;
  startTime: string;
  endTime: string;
  position: number;
  cells: ScheduleCellData[];
}

export interface ClassScheduleData {
  classId: string;
  className: string;
  level: string | null;
  schoolYear: string;
  publishedAt: Date | null;
  lastUpdatedAt: Date | null;
  rows: ScheduleRowData[];
}

export interface SubjectSummary {
  id: string;
  name: string;
  color: string | null;
}

/* ------------------------------ Lecture publique ------------------------------ */

/** Liste des classes, triées par niveau puis nom — page publique /emplois-du-temps */
export async function getSchoolClasses(): Promise<ClassSummary[]> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return [];

  try {
    return await prisma.schoolClass.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        level: true,
        schoolYear: true,
        publishedAt: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors du chargement des classes:", error);
    throw error;
  }
}

/** Classes publiées visibles par l'utilisateur connecté. */
export async function getPublishedSchoolClasses(): Promise<ClassSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const schoolClassId =
      user.role === "USER"
        ? (
            await prisma.user.findUnique({
              where: { id: user.id },
              select: { schoolClassId: true },
            })
          )?.schoolClassId
        : undefined;
    if (user.role === "USER" && !schoolClassId) return [];

    return await prisma.schoolClass.findMany({
      where: {
        publishedAt: { not: null },
        ...(schoolClassId ? { id: schoolClassId } : {}),
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        level: true,
        schoolYear: true,
        publishedAt: true,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement des emplois du temps publiés:",
      error,
    );
    throw error;
  }
}

/** Emploi du temps visible par le compte courant (lignes + cases). */
export async function getClassSchedule(
  classId: string,
): Promise<ClassScheduleData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const schoolClassId =
      user.role === "USER"
        ? (
            await prisma.user.findUnique({
              where: { id: user.id },
              select: { schoolClassId: true },
            })
          )?.schoolClassId
        : undefined;
    if (user.role === "USER" && !schoolClassId) return null;
    if (schoolClassId && classId !== schoolClassId) return null;

    const schoolClass = await prisma.schoolClass.findFirst({
      where: schoolClassId
        ? { id: classId, publishedAt: { not: null } }
        : { id: classId },
      select: {
        id: true,
        name: true,
        level: true,
        schoolYear: true,
        publishedAt: true,
        rows: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            position: true,
            cells: {
              select: {
                day: true,
                subject: { select: { id: true, name: true, color: true } },
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!schoolClass) return null;

    return {
      classId: schoolClass.id,
      className: schoolClass.name,
      level: schoolClass.level,
      schoolYear: schoolClass.schoolYear,
      publishedAt: schoolClass.publishedAt,
      lastUpdatedAt:
        schoolClass.rows
          .flatMap((row) => row.cells.map((cell) => cell.updatedAt))
          .sort((first, second) => second.getTime() - first.getTime())[0] ??
        null,
      rows: schoolClass.rows
        .map((row) => ({
          id: row.id,
          startTime: row.startTime,
          endTime: row.endTime,
          position: row.position,
          cells: WEEKDAYS.map((day) => {
            const existing = row.cells.find((c) => c.day === day);
            return {
              day,
              subjectId: existing?.subject?.id ?? null,
              subjectName: existing?.subject?.name ?? null,
              subjectColor: existing?.subject?.color ?? null,
              updatedAt: existing?.updatedAt ?? null,
            };
          }),
        }))
        .sort((first, second) => {
          const firstStart =
            parseScheduleTime(first.startTime) ?? Number.MAX_SAFE_INTEGER;
          const secondStart =
            parseScheduleTime(second.startTime) ?? Number.MAX_SAFE_INTEGER;
          return firstStart - secondStart || first.position - second.position;
        }),
    };
  } catch (error) {
    console.error("Erreur lors du chargement de l'emploi du temps:", error);
    throw error;
  }
}

export async function listSubjects(): Promise<SubjectSummary[]> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return [];

  try {
    return await prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    });
  } catch (error) {
    console.error("Erreur lors du chargement des matières:", error);
    throw error;
  }
}

/* --------------------------------- Gestion : classes --------------------------------- */

type SimpleSuccess = { success: true };
type SimpleError = {
  error:
    | "auth_required"
    | "forbidden"
    | "invalid"
    | "duplicate"
    | "not_found"
    | "conflict"
    | "empty"
    | "unknown";
  message?: string;
};

function scheduleConflictMessage(
  day: Weekday,
  startTime: string,
  endTime: string,
  subjectName: string,
): string {
  return `Conflit avec ${subjectName} le ${day.toLocaleLowerCase("fr")} (${startTime}–${endTime}).`;
}

async function findCellConflict(
  transaction: Prisma.TransactionClient,
  classId: string,
  excludedRowId: string,
  day: Weekday,
  startTime: string,
  endTime: string,
): Promise<SimpleError | null> {
  const start = parseScheduleTime(startTime);
  const end = parseScheduleTime(endTime);
  if (start === null || end === null || start >= end) {
    return { error: "invalid", message: "Le créneau horaire est invalide." };
  }

  const rows = await transaction.scheduleRow.findMany({
    where: {
      classId,
      id: { not: excludedRowId },
      cells: { some: { day, subjectId: { not: null } } },
    },
    select: {
      startTime: true,
      endTime: true,
      cells: {
        where: { day, subjectId: { not: null } },
        select: { subject: { select: { name: true } } },
      },
    },
  });

  for (const row of rows) {
    const existingStart = parseScheduleTime(row.startTime);
    const existingEnd = parseScheduleTime(row.endTime);
    if (
      existingStart === null ||
      existingEnd === null ||
      existingStart >= existingEnd
    ) {
      return {
        error: "invalid",
        message:
          "Un autre créneau de cette journée contient des horaires invalides.",
      };
    }
    if (
      scheduleTimesOverlap(start, end, existingStart, existingEnd) &&
      row.cells[0]?.subject?.name
    ) {
      return {
        error: "conflict",
        message: scheduleConflictMessage(
          day,
          row.startTime,
          row.endTime,
          row.cells[0].subject.name,
        ),
      };
    }
  }

  return null;
}

async function findScheduleConflict(
  transaction: Prisma.TransactionClient,
  classId: string,
): Promise<SimpleError | null> {
  const rows = await transaction.scheduleRow.findMany({
    where: {
      classId,
      cells: { some: { subjectId: { not: null } } },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      cells: {
        where: { subjectId: { not: null } },
        select: { day: true, subject: { select: { name: true } } },
      },
    },
  });

  for (const row of rows) {
    const start = parseScheduleTime(row.startTime);
    const end = parseScheduleTime(row.endTime);
    if (start === null || end === null || start >= end) {
      return {
        error: "invalid",
        message: "Le planning contient un créneau horaire invalide.",
      };
    }

    for (const other of rows) {
      if (row.id === other.id) continue;
      const otherStart = parseScheduleTime(other.startTime);
      const otherEnd = parseScheduleTime(other.endTime);
      if (otherStart === null || otherEnd === null || otherStart >= otherEnd) {
        return {
          error: "invalid",
          message: "Le planning contient un créneau horaire invalide.",
        };
      }

      const sharedDay = row.cells.find((cell) =>
        other.cells.some((otherCell) => otherCell.day === cell.day),
      );
      if (sharedDay && scheduleTimesOverlap(start, end, otherStart, otherEnd)) {
        const otherCell = other.cells.find(
          (cell) => cell.day === sharedDay.day,
        );
        if (otherCell?.subject?.name) {
          return {
            error: "conflict",
            message: scheduleConflictMessage(
              sharedDay.day,
              other.startTime,
              other.endTime,
              otherCell.subject.name,
            ),
          };
        }
      }
    }
  }

  return null;
}

export async function createClass(
  name: string,
  level: string,
  schoolYear: string,
): Promise<(SimpleSuccess & { id: string }) | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof name !== "string" ||
    typeof level !== "string" ||
    typeof schoolYear !== "string"
  ) {
    return { error: "invalid" };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "invalid" };

  try {
    const existing = await prisma.schoolClass.findUnique({
      where: { name: trimmedName },
    });
    if (existing) return { error: "duplicate" };

    const created = await prisma.schoolClass.create({
      data: {
        name: trimmedName,
        level: level.trim() || null,
        schoolYear: schoolYear.trim() || "2026-2027",
      },
    });

    revalidatePath("/admin/schedules");
    revalidatePath("/admin/users");
    revalidatePath("/signup");
    revalidatePath("/emplois-du-temps");
    return { success: true, id: created.id };
  } catch (error) {
    console.error("Erreur lors de la création de la classe:", error);
    return { error: "unknown" };
  }
}

export async function deleteClass(
  classId: string,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof classId !== "string" ||
    classId.length === 0 ||
    classId.length > 128
  ) {
    return { error: "invalid" };
  }

  try {
    const existing = await prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!existing) return { error: "not_found" };

    await prisma.schoolClass.delete({ where: { id: classId } });

    revalidatePath("/admin/schedules");
    revalidatePath("/admin/users");
    revalidatePath("/signup");
    revalidatePath("/emplois-du-temps");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la classe:", error);
    return { error: "unknown" };
  }
}

/* -------------------------------- Gestion : matières -------------------------------- */

export async function createSubject(
  name: string,
  color: string,
): Promise<(SimpleSuccess & { id: string }) | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof name !== "string" ||
    typeof color !== "string" ||
    (color !== "" && !/^#[\da-f]{6}$/i.test(color))
  ) {
    return { error: "invalid" };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "invalid" };

  try {
    const existing = await prisma.subject.findUnique({
      where: { name: trimmedName },
    });
    if (existing) return { error: "duplicate" };

    const created = await prisma.subject.create({
      data: { name: trimmedName, color: color.trim() || null },
    });

    revalidatePath("/admin/schedules");
    return { success: true, id: created.id };
  } catch (error) {
    console.error("Erreur lors de la création de la matière:", error);
    return { error: "unknown" };
  }
}

export async function deleteSubject(
  subjectId: string,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof subjectId !== "string" ||
    subjectId.length === 0 ||
    subjectId.length > 128
  ) {
    return { error: "invalid" };
  }

  try {
    const existing = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!existing) return { error: "not_found" };

    await prisma.subject.delete({ where: { id: subjectId } });

    revalidatePath("/admin/schedules");
    revalidatePath("/emplois-du-temps");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière:", error);
    return { error: "unknown" };
  }
}

export async function setSchedulePublished(
  classId: string,
  published: boolean,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof classId !== "string" ||
    classId.length === 0 ||
    classId.length > 128 ||
    typeof published !== "boolean"
  ) {
    return { error: "invalid" };
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const schoolClass = await transaction.schoolClass.findUnique({
          where: { id: classId },
          select: {
            id: true,
            rows: {
              select: {
                cells: {
                  where: { subjectId: { not: null } },
                  select: { id: true },
                },
              },
            },
          },
        });
        if (!schoolClass) return { error: "not_found" } as const;

        if (published) {
          if (!schoolClass.rows.some((row) => row.cells.length > 0)) {
            return {
              error: "empty",
              message: "Ajoutez au moins une séance avant de publier.",
            } as const;
          }
          const conflict = await findScheduleConflict(transaction, classId);
          if (conflict) return conflict;
        }

        await transaction.schoolClass.update({
          where: { id: classId },
          data: { publishedAt: published ? new Date() : null },
        });
        return { success: true } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) return result;
    revalidatePath("/admin/schedules");
    revalidatePath(`/admin/schedules/${classId}`);
    revalidatePath("/emplois-du-temps");
    revalidatePath(`/emplois-du-temps/${classId}`);
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "P2034" || error.code === "P2002")
    ) {
      return {
        error: "conflict",
        message: "Le planning a changé pendant la publication. Réessayez.",
      };
    }
    console.error("Erreur lors de la publication de l'emploi du temps:", error);
    return { error: "unknown" };
  }
}

/* ----------------------------- Gestion : lignes horaires ----------------------------- */

export async function addScheduleRow(
  classId: string,
  startTime: string,
  endTime: string,
): Promise<(SimpleSuccess & { id: string }) | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  if (
    typeof classId !== "string" ||
    classId.length === 0 ||
    classId.length > 128 ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    !isValidScheduleTimeRange(startTime, endTime)
  ) {
    return {
      error: "invalid",
      message: "Saisissez des horaires valides au format HH:MM.",
    };
  }

  try {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!schoolClass) return { error: "not_found" };

    const lastRow = await prisma.scheduleRow.findFirst({
      where: { classId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const created = await prisma.scheduleRow.create({
      data: {
        classId,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        position: (lastRow?.position ?? -1) + 1,
      },
    });

    revalidatePath(`/admin/schedules/${classId}`);
    revalidatePath(`/emplois-du-temps/${classId}`);
    return { success: true, id: created.id };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la ligne:", error);
    return { error: "unknown" };
  }
}

export async function updateScheduleRow(
  rowId: string,
  startTime: string,
  endTime: string,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  if (
    typeof rowId !== "string" ||
    rowId.length === 0 ||
    rowId.length > 128 ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    !isValidScheduleTimeRange(startTime, endTime)
  ) {
    return {
      error: "invalid",
      message: "Saisissez des horaires valides au format HH:MM.",
    };
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const row = await transaction.scheduleRow.findUnique({
          where: { id: rowId },
          select: {
            classId: true,
            cells: {
              where: { subjectId: { not: null } },
              select: { day: true },
            },
          },
        });
        if (!row) return { error: "not_found" } as const;

        for (const cell of row.cells) {
          const conflict = await findCellConflict(
            transaction,
            row.classId,
            rowId,
            cell.day,
            startTime,
            endTime,
          );
          if (conflict) return conflict;
        }

        await transaction.scheduleRow.update({
          where: { id: rowId },
          data: { startTime: startTime.trim(), endTime: endTime.trim() },
        });
        return { success: true, classId: row.classId } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if ("error" in result) return result;

    revalidatePath(`/admin/schedules/${result.classId}`);
    revalidatePath(`/emplois-du-temps/${result.classId}`);
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2034"
    ) {
      return {
        error: "conflict",
        message: "Le planning vient d'être modifié. Réessayez.",
      };
    }
    console.error("Erreur lors de la modification de la ligne:", error);
    return { error: "unknown" };
  }
}

export async function deleteScheduleRow(
  rowId: string,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (typeof rowId !== "string" || rowId.length === 0 || rowId.length > 128) {
    return { error: "invalid" };
  }

  try {
    const row = await prisma.scheduleRow.findUnique({
      where: { id: rowId },
      select: { classId: true },
    });
    if (!row) return { error: "not_found" };

    await prisma.scheduleRow.delete({ where: { id: rowId } });

    revalidatePath(`/admin/schedules/${row.classId}`);
    revalidatePath(`/emplois-du-temps/${row.classId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la ligne:", error);
    return { error: "unknown" };
  }
}

export async function moveScheduleRow(
  rowId: string,
  direction: "up" | "down",
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof rowId !== "string" ||
    rowId.length === 0 ||
    rowId.length > 128 ||
    (direction !== "up" && direction !== "down")
  ) {
    return { error: "invalid" };
  }

  try {
    const row = await prisma.scheduleRow.findUnique({ where: { id: rowId } });
    if (!row) return { error: "not_found" };

    const neighbor = await prisma.scheduleRow.findFirst({
      where: {
        classId: row.classId,
        position:
          direction === "up" ? { lt: row.position } : { gt: row.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) return { success: true };

    await prisma.$transaction([
      prisma.scheduleRow.update({
        where: { id: row.id },
        data: { position: neighbor.position },
      }),
      prisma.scheduleRow.update({
        where: { id: neighbor.id },
        data: { position: row.position },
      }),
    ]);

    revalidatePath(`/admin/schedules/${row.classId}`);
    revalidatePath(`/emplois-du-temps/${row.classId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du déplacement de la ligne:", error);
    return { error: "unknown" };
  }
}

/* --------------------------- Gestion : cases (matière du jour) --------------------------- */

export async function setScheduleCell(
  rowId: string,
  day: Weekday,
  subjectId: string | null,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    typeof rowId !== "string" ||
    rowId.length === 0 ||
    rowId.length > 128 ||
    !WEEKDAYS.some((weekday) => weekday === day) ||
    (subjectId !== null &&
      (typeof subjectId !== "string" ||
        subjectId.length === 0 ||
        subjectId.length > 128))
  ) {
    return { error: "invalid" };
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const row = await transaction.scheduleRow.findUnique({
          where: { id: rowId },
          select: {
            classId: true,
            startTime: true,
            endTime: true,
          },
        });
        if (!row) return { error: "not_found" } as const;

        if (subjectId) {
          const subject = await transaction.subject.findUnique({
            where: { id: subjectId },
            select: { id: true },
          });
          if (!subject) return { error: "not_found" } as const;

          const conflict = await findCellConflict(
            transaction,
            row.classId,
            rowId,
            day,
            row.startTime,
            row.endTime,
          );
          if (conflict) return conflict;

          await transaction.scheduleCell.upsert({
            where: { rowId_day: { rowId, day } },
            create: { rowId, day, subjectId },
            update: { subjectId },
          });
        } else {
          await transaction.scheduleCell.deleteMany({ where: { rowId, day } });
        }

        return { success: true, classId: row.classId } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if ("error" in result) return result;

    revalidatePath(`/admin/schedules/${result.classId}`);
    revalidatePath(`/emplois-du-temps/${result.classId}`);
    revalidatePath("/emplois-du-temps");
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "P2034" || error.code === "P2002")
    ) {
      return {
        error: "conflict",
        message: "Le planning vient d'être modifié. Actualisez puis réessayez.",
      };
    }
    console.error("Erreur lors de la mise à jour de la case:", error);
    return { error: "unknown" };
  }
}

export async function moveScheduleCell(
  sourceRowId: string,
  sourceDay: Weekday,
  targetRowId: string,
  targetDay: Weekday,
  subjectId: string,
): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };
  if (
    [sourceRowId, targetRowId, subjectId].some(
      (value) =>
        typeof value !== "string" || value.length === 0 || value.length > 128,
    ) ||
    !WEEKDAYS.some((weekday) => weekday === sourceDay) ||
    !WEEKDAYS.some((weekday) => weekday === targetDay)
  ) {
    return { error: "invalid" };
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const [source, target, subject] = await Promise.all([
          transaction.scheduleRow.findUnique({
            where: { id: sourceRowId },
            select: {
              classId: true,
              cells: {
                where: { day: sourceDay },
                select: { id: true },
              },
            },
          }),
          transaction.scheduleRow.findUnique({
            where: { id: targetRowId },
            select: {
              classId: true,
              startTime: true,
              endTime: true,
              cells: {
                where: { day: targetDay, subjectId: { not: null } },
                select: { id: true },
              },
            },
          }),
          transaction.subject.findUnique({
            where: { id: subjectId },
            select: { id: true },
          }),
        ]);
        if (
          !source ||
          !target ||
          !subject ||
          source.classId !== target.classId
        ) {
          return { error: "not_found" } as const;
        }

        const sameCell = sourceRowId === targetRowId && sourceDay === targetDay;
        if (!sameCell && target.cells.length > 0) {
          return {
            error: "conflict",
            message: "Le créneau de destination contient déjà une séance.",
          } as const;
        }

        const conflict = await findCellConflict(
          transaction,
          target.classId,
          targetRowId,
          targetDay,
          target.startTime,
          target.endTime,
        );
        if (conflict) return conflict;

        await transaction.scheduleCell.upsert({
          where: { rowId_day: { rowId: targetRowId, day: targetDay } },
          create: { rowId: targetRowId, day: targetDay, subjectId },
          update: { subjectId },
        });
        if (!sameCell) {
          await transaction.scheduleCell.deleteMany({
            where: { rowId: sourceRowId, day: sourceDay },
          });
        }
        return { success: true, classId: target.classId } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if ("error" in result) return result;

    revalidatePath(`/admin/schedules/${result.classId}`);
    revalidatePath(`/emplois-du-temps/${result.classId}`);
    revalidatePath("/emplois-du-temps");
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "P2034" || error.code === "P2002")
    ) {
      return {
        error: "conflict",
        message: "Le planning vient d'être modifié. Actualisez puis réessayez.",
      };
    }
    console.error("Erreur lors du déplacement d'une séance:", error);
    return { error: "unknown" };
  }
}
