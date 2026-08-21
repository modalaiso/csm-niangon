import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClassSchedule } from "@/app/actions/schedules";
import { ScheduleExport } from "@/components/schedule/schedule-export";

interface SchedulePageProps {
  params: Promise<{ classId: string }>;
}

export async function generateMetadata({ params }: Readonly<SchedulePageProps>) {
  const { classId } = await params;
  const schedule = await getClassSchedule(classId);
  if (!schedule) {
    return { title: "Emploi du temps introuvable | CSM Niangon" };
  }
  return {
    title: `Emploi du temps - ${schedule.className} | CSM Niangon`,
    description: `Emploi du temps de la classe ${schedule.className}`,
  };
}

export default async function SchedulePage({ params }: Readonly<SchedulePageProps>) {
  const { classId } = await params;
  const schedule = await getClassSchedule(classId);

  if (!schedule) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-5xl px-4 py-6 sm:py-8">
        <Link
          href="/emplois-du-temps"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:underline print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="mt-6">
          <ScheduleExport schedule={schedule} />
        </div>
      </div>
    </main>
  );
}