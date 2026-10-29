import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { getPublishedSchoolClasses } from "@/app/actions/schedules";

export const metadata = {
  title: "Emplois du temps | CSM Niangon",
  description: "Consultez l'emploi du temps de chaque classe du CSM Niangon",
};

export default async function SchedulesPage() {
  const classes = await getPublishedSchoolClasses();

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
          Consultez le planning publié de votre classe, puis imprimez-le au
          format A4.
        </p>
      </div>

      <div className="container px-4 pb-10">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              Aucun emploi du temps publié n'est rattaché à votre compte.
            </p>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Connectez-vous et demandez à l'administration d'associer votre
              compte à la classe de l'élève si nécessaire.
            </p>
            <Link
              href="/login"
              className="mt-3 rounded-md px-3 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Se connecter
            </Link>
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
                      className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-4 transition-colors hover:border-primary/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
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
