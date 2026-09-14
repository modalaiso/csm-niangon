import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ensureClassScheduleRows,
  getClassSchedule,
  listSubjects,
} from "@/app/actions/schedules";
import { ScheduleEditor } from "@/components/admin/schedule-editor";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Modifier l'emploi du temps | Dashboard - CSM Niangon",
};

interface AdminScheduleEditPageProps {
  params: Promise<{ classId: string }>;
}

export default async function AdminScheduleEditPage({
  params,
}: Readonly<AdminScheduleEditPageProps>) {
  await requirePostManager();
  const { classId } = await params;
  await ensureClassScheduleRows(classId);

  const [schedule, subjects] = await Promise.all([
    getClassSchedule(classId),
    listSubjects(),
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/schedules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux emplois du temps
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Construction de l’agenda
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {schedule.className}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {schedule.level ?? "Niveau non renseigné"} · Année scolaire{" "}
            {schedule.schoolYear}
          </p>
        </div>
        <span className="flex w-fit items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {schedule.rows.length} créneau{schedule.rows.length > 1 ? "x" : ""}{" "}
          configuré{schedule.rows.length > 1 ? "s" : ""}
        </span>
      </div>
      <ScheduleEditor
        classId={classId}
        initialSchedule={schedule}
        subjects={subjects}
      />
    </div>
  );
}
