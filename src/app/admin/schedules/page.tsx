import { getSchoolClasses, listSubjects } from "@/app/actions/schedules";
import { ClassSubjectManager } from "@/components/admin/class-subject-manager";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Emplois du temps | Dashboard - CSM Niangon",
};

export default async function AdminSchedulesPage() {
  await requirePostManager();
  const [classes, subjects] = await Promise.all([
    getSchoolClasses(),
    listSubjects(),
  ]);

  return (
    <div>
      <div className="mb-8 rounded-3xl border border-border bg-gradient-to-br from-primary/[0.08] via-background to-background px-6 py-7 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Agenda scolaire
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Emplois du temps
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Organisez les semaines de vos classes dans un espace simple, visuel et
          toujours prêt à être partagé.
        </p>
      </div>
      <ClassSubjectManager
        initialClasses={classes}
        subjectCount={subjects.length}
      />
    </div>
  );
}
