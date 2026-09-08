import { CalendarClock } from "lucide-react";
import Link from "next/link";
import type { ClassSummary } from "@/app/actions/schedules";

interface OtherClassesListProps {
  classes: ClassSummary[];
  currentClassId: string;
}

export function OtherClassesList(props: Readonly<OtherClassesListProps>) {
  const others = props.classes.filter((c) => c.id !== props.currentClassId);
  if (others.length === 0) return null;

  const grouped = others.reduce<Record<string, ClassSummary[]>>((acc, c) => {
    const key = c.level ?? "Autres classes";
    acc[key] = acc[key] ? [...acc[key], c] : [c];
    return acc;
  }, {});

  return (
    <div className="mt-10 print:hidden">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        Autres emplois du temps
      </h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([level, items]) => (
          <section key={level}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {level}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/emplois-du-temps/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
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
    </div>
  );
}