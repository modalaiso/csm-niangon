"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  GraduationCap,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  type ClassSummary,
  createClass,
  deleteClass,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClassSubjectManagerProps {
  initialClasses: ClassSummary[];
  subjectCount: number;
}

export function ClassSubjectManager(props: Readonly<ClassSubjectManagerProps>) {
  const [classes, setClasses] = useState(props.initialClasses);
  const [className, setClassName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const filteredClasses = useMemo(
    () =>
      classes.filter((item) =>
        `${item.name} ${item.level ?? ""}`
          .toLocaleLowerCase("fr")
          .includes(search.toLocaleLowerCase("fr")),
      ),
    [classes, search],
  );

  const addClass = () => {
    if (!className.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createClass(className, classLevel, schoolYear);
      if ("error" in result)
        return setError(
          result.error === "duplicate"
            ? "Cette classe existe déjà."
            : "Impossible de créer cette classe.",
        );
      setClasses((current) =>
        [
          ...current,
          {
            id: result.id,
            name: className.trim(),
            level: classLevel.trim() || null,
            schoolYear,
          },
        ].sort((a, b) => a.name.localeCompare(b.name, "fr")),
      );
      setClassName("");
      setClassLevel("");
    });
  };
  const removeClass = (item: ClassSummary) => {
    if (
      !window.confirm(
        `Supprimer la classe « ${item.name} » et son emploi du temps ?`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteClass(item.id);
      if ("error" in result) setError("Impossible de supprimer cette classe.");
      else
        setClasses((current) =>
          current.filter((entry) => entry.id !== item.id),
        );
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{classes.length}</p>
              <p className="text-xs text-muted-foreground">Classes actives</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/schedules/subjects"
          className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{props.subjectCount}</p>
              <p className="text-xs text-muted-foreground">
                Matières disponibles
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
        <Link
          href="/admin/schedules/hours"
          className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{schoolYear}</p>
              <p className="text-xs text-muted-foreground">Modèle horaire</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <section className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary p-2 text-white">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Créer une nouvelle classe</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Les créneaux de l’année sélectionnée seront générés
              automatiquement.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr_150px_auto]">
          <Input
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addClass()}
            placeholder="Nom de la classe · ex. 3e A"
            aria-label="Nom de la classe"
          />
          <Input
            value={classLevel}
            onChange={(event) => setClassLevel(event.target.value)}
            placeholder="Niveau · ex. 3e"
            aria-label="Niveau"
          />
          <Input
            value={schoolYear}
            onChange={(event) => setSchoolYear(event.target.value)}
            placeholder="2026-2027"
            aria-label="Année scolaire"
          />
          <Button
            type="button"
            onClick={addClass}
            disabled={isPending || !className.trim()}
            className="gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Créer
          </Button>
        </div>
      </section>
      <section className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <LayoutGrid className="h-4 w-4 text-primary" />
              Vos emplois du temps
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ouvrez une classe pour construire sa semaine.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une classe"
              aria-label="Rechercher une classe"
              className="pl-9 sm:w-56"
            />
          </div>
        </div>
        {filteredClasses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-background px-5 py-14 text-center text-sm text-muted-foreground">
            {classes.length
              ? "Aucune classe ne correspond à cette recherche."
              : "Aucune classe pour le moment. Créez votre première classe ci-dessus."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((item, index) => (
              <article
                key={item.id}
                className="group rounded-3xl border border-border bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold",
                      index % 3 === 0
                        ? "bg-primary/10 text-primary"
                        : index % 3 === 1
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-600",
                    )}
                  >
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClass(item)}
                    disabled={isPending}
                    aria-label={`Supprimer ${item.name}`}
                    className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-4 truncate font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.level ?? "Niveau non renseigné"}{" "}
                  <span className="mx-1">·</span> {item.schoolYear}
                </p>
                <Link
                  href={`/admin/schedules/${item.id}`}
                  className="mt-5 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Construire le planning
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="flex flex-wrap gap-3 rounded-3xl border border-border bg-background p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Settings2 className="h-4 w-4 text-primary" />
          Ressources partagées
        </p>
        <Link
          href="/admin/schedules/subjects"
          className="rounded-xl bg-muted px-3 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary"
        >
          Gérer les matières
        </Link>
        <Link
          href="/admin/schedules/hours"
          className="rounded-xl bg-muted px-3 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary"
        >
          Gérer les horaires
        </Link>
      </div>
    </div>
  );
}
