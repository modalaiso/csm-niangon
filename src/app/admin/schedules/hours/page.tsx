import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getScheduleTimeTemplates } from "@/app/actions/schedules";
import { TimeTemplateManager } from "@/components/admin/time-template-manager";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Horaires | Emplois du temps | Dashboard - CSM Niangon",
};

export default async function AdminHoursPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ annee?: string }> }>) {
  await requirePostManager();
  const params = await searchParams;
  const schoolYear = params.annee?.trim() || "2026-2027";
  const templates = await getScheduleTimeTemplates(schoolYear);
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
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Horaires</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Définissez les blocs de la journée. Ils seront repris automatiquement
          dans les nouveaux plannings.
        </p>
      </div>
      <TimeTemplateManager
        initialTemplates={templates}
        initialSchoolYear={schoolYear}
      />
    </div>
  );
}
