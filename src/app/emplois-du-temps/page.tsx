import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { getSchoolClasses } from "@/app/actions/schedules";

export const metadata = {
  title: "Emplois du temps | CSM Niangon",
  description: "Consultez l'emploi du temps de chaque classe du CSM Niangon",
};

export default async function SchedulesPage() {
  const classes = await getSchoolClasses();

  const grouped = classes.reduce<Record<string, typeof classes>>((acc, c) => {
    const key = c.level ?? "Autres classes";
    acc[key] = acc[key] ? [...acc[key], c] : [c];
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 mt-16 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Emplois du temps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez, imprimez ou téléchargez l'emploi du temps de chaque classe.
        </p>
      </div>

      <div className="container px-4 pb-10">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              Aucun emploi du temps n'est disponible pour l'instant.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([level, items]) => (
              <section key={level}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {level}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((c) => (
                    <Link
                      key={c.id}
                      href={`/emplois-du-temps/${c.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-primary/40"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarClock className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {c.schoolYear}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
