import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { listSubjects } from "@/app/actions/schedules";
import { SubjectManager } from "@/components/admin/subject-manager";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Matières | Emplois du temps | Dashboard - CSM Niangon",
};

export default async function AdminSubjectsPage() {
  await requirePostManager();
  const subjects = await listSubjects();
  return (
    <div>
      <Link
        href="/admin/schedules"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux emplois du temps
      </Link>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Ressources partagées
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Matières</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Créez une palette cohérente pour visualiser les cours de toutes vos
          classes.
        </p>
      </div>
      <SubjectManager initialSubjects={subjects} />
    </div>
  );
}
