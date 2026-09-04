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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Emplois du temps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les classes, les matières, et l'emploi du temps de chaque
          classe.
        </p>
      </div>
      <ClassSubjectManager
        initialClasses={classes}
        initialSubjects={subjects}
      />
    </div>
  );
}
