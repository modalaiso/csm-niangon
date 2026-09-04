import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassSchedule, listSubjects } from "@/app/actions/schedules";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {schedule.className}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {schedule.level ?? "—"} · Année scolaire {schedule.schoolYear}
        </p>
      </div>
      <ScheduleEditor
        classId={classId}
        initialSchedule={schedule}
        subjects={subjects}
      />
    </div>
  );
}
