"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Weekday } from "@prisma/client";
import { getPostManagerAuthContext } from "@/lib/auth/admin-guard";
import { WEEKDAYS } from "@/lib/schedules";

/* --------------------------------- Types --------------------------------- */

export interface ClassSummary {
  id: string;
  name: string;
  level: string | null;
  schoolYear: string;
}

export interface ScheduleCellData {
  day: Weekday;
  subjectId: string | null;
  subjectName: string | null;
  subjectColor: string | null;
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
  try {
    return await prisma.schoolClass.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: { id: true, name: true, level: true, schoolYear: true },
    });
  } catch (error) {
    console.error("Erreur lors du chargement des classes:", error);
    return [];
  }
}

/** Emploi du temps complet d'une classe (lignes + cases), pour affichage et export */
export async function getClassSchedule(classId: string): Promise<ClassScheduleData | null> {
  try {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        level: true,
        schoolYear: true,
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
      rows: schoolClass.rows.map((row) => ({
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
          };
        }),
      })),
    };
  } catch (error) {
    console.error("Erreur lors du chargement de l'emploi du temps:", error);
    return null;
  }
}

export async function listSubjects(): Promise<SubjectSummary[]> {
  try {
    return await prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    });
  } catch (error) {
    console.error("Erreur lors du chargement des matières:", error);
    return [];
  }
}

/* --------------------------------- Gestion : classes --------------------------------- */

type SimpleSuccess = { success: true };
type SimpleError = {
  error: "auth_required" | "forbidden" | "invalid" | "duplicate" | "not_found" | "unknown";
};

export async function createClass(
  name: string,
  level: string,
  schoolYear: string,
): Promise<(SimpleSuccess & { id: string }) | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "invalid" };

  try {
    const existing = await prisma.schoolClass.findUnique({ where: { name: trimmedName } });
    if (existing) return { error: "duplicate" };

    const created = await prisma.schoolClass.create({
      data: {
        name: trimmedName,
        level: level.trim() || null,
        schoolYear: schoolYear.trim() || "2026-2027",
      },
    });

    revalidatePath("/admin/schedules");
    revalidatePath("/emplois-du-temps");
    return { success: true, id: created.id };
  } catch (error) {
    console.error("Erreur lors de la création de la classe:", error);
    return { error: "unknown" };
  }
}

export async function deleteClass(classId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const existing = await prisma.schoolClass.findUnique({ where: { id: classId } });
    if (!existing) return { error: "not_found" };

    await prisma.schoolClass.delete({ where: { id: classId } });

    revalidatePath("/admin/schedules");
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

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "invalid" };

  try {
    const existing = await prisma.subject.findUnique({ where: { name: trimmedName } });
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

export async function deleteSubject(subjectId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const existing = await prisma.subject.findUnique({ where: { id: subjectId } });
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

/* ----------------------------- Gestion : lignes horaires ----------------------------- */

export async function addScheduleRow(
  classId: string,
  startTime: string,
  endTime: string,
): Promise<(SimpleSuccess & { id: string }) | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  if (!startTime.trim() || !endTime.trim()) return { error: "invalid" };

  try {
    const schoolClass = await prisma.schoolClass.findUnique({ where: { id: classId } });
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

  if (!startTime.trim() || !endTime.trim()) return { error: "invalid" };

  try {
    const row = await prisma.scheduleRow.update({
      where: { id: rowId },
      data: { startTime: startTime.trim(), endTime: endTime.trim() },
      select: { classId: true },
    });

    revalidatePath(`/admin/schedules/${row.classId}`);
    revalidatePath(`/emplois-du-temps/${row.classId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la modification de la ligne:", error);
    return { error: "unknown" };
  }
}

export async function deleteScheduleRow(rowId: string): Promise<SimpleSuccess | SimpleError> {
  const auth = await getPostManagerAuthContext();
  if (!auth.ok) return { error: auth.error };

  try {
    const row = await prisma.scheduleRow.findUnique({ where: { id: rowId }, select: { classId: true } });
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

  try {
    const row = await prisma.scheduleRow.findUnique({ where: { id: rowId } });
    if (!row) return { error: "not_found" };

    const neighbor = await prisma.scheduleRow.findFirst({
      where: {
        classId: row.classId,
        position: direction === "up" ? { lt: row.position } : { gt: row.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) return { success: true };

    await prisma.$transaction([
      prisma.scheduleRow.update({ where: { id: row.id }, data: { position: neighbor.position } }),
      prisma.scheduleRow.update({ where: { id: neighbor.id }, data: { position: row.position } }),
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

  try {
    const row = await prisma.scheduleRow.findUnique({ where: { id: rowId }, select: { classId: true } });
    if (!row) return { error: "not_found" };

    if (subjectId) {
      await prisma.scheduleCell.upsert({
        where: { rowId_day: { rowId, day } },
        create: { rowId, day, subjectId },
        update: { subjectId },
      });
    } else {
      await prisma.scheduleCell.deleteMany({ where: { rowId, day } });
    }

    revalidatePath(`/admin/schedules/${row.classId}`);
    revalidatePath(`/emplois-du-temps/${row.classId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la case:", error);
    return { error: "unknown" };
  }
}