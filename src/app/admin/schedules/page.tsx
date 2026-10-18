import { getSchoolClasses, listSubjects } from "@/app/actions/schedules";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Emplois du temps"
        description="Organisez les classes et les matières, puis composez les horaires de chaque classe."
      />
      <ClassSubjectManager
        initialClasses={classes}
        initialSubjects={subjects}
      />
    </div>
  );
}
