import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassSchedule, listSubjects } from "@/app/actions/schedules";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/schedules"
        className="mb-4 inline-flex items-center gap-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux emplois du temps
      </Link>
      <AdminPageHeader
        title={schedule.className}
        description={`${schedule.level ?? "Niveau non renseigné"} · Année scolaire ${schedule.schoolYear}`}
      />
      <ScheduleEditor
        classId={classId}
        initialSchedule={schedule}
        subjects={subjects}
      />
    </div>
  );
}
