"use client";

import { Check, Palette, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  createSubject,
  deleteSubject,
  type SubjectSummary,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLORS = [
  "#42AA4A",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#EF4444",
  "#F97316",
];

export function SubjectManager(
  props: Readonly<{ initialSubjects: SubjectSummary[] }>,
) {
  const [subjects, setSubjects] = useState(props.initialSubjects);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const add = () => {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createSubject(name, color);
      if ("error" in result) {
        setError(
          result.error === "duplicate"
            ? "Cette matière existe déjà."
            : "Impossible de créer cette matière.",
        );
        return;
      }
      setSubjects((current) =>
        [...current, { id: result.id, name: name.trim(), color }].sort((a, b) =>
          a.name.localeCompare(b.name, "fr"),
        ),
      );
      setName("");
    });
  };

  const remove = (subject: SubjectSummary) => {
    if (!window.confirm(`Supprimer la matière « ${subject.name} » ?`)) return;
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if ("error" in result) {
        setError("Impossible de supprimer cette matière.");
        return;
      }
      setSubjects((current) =>
        current.filter((item) => item.id !== subject.id),
      );
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
      <section className="h-fit rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Palette className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Nouvelle matière</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Les couleurs permettent de repérer les cours en un regard.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="subject-name"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
            >
              Nom de la matière
            </label>
            <Input
              id="subject-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && add()}
              placeholder="Mathématiques"
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Couleur
            </p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  aria-label={`Choisir la couleur ${item}`}
                  style={{ backgroundColor: item }}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    color === item
                      ? "scale-110 border-foreground ring-2 ring-white ring-offset-1"
                      : "border-transparent",
                  )}
                />
              ))}
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-2xl border border-border p-3 text-sm"
            style={{ color, backgroundColor: `${color}14` }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {name.trim() || "Aperçu de la matière"}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            onClick={add}
            disabled={isPending || !name.trim()}
            className="w-full gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter à la bibliothèque
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-3 border-b border-border pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Bibliothèque partagée
            </p>
            <h2 className="mt-1 text-xl font-semibold">Toutes les matières</h2>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {subjects.length} matière{subjects.length > 1 ? "s" : ""}
          </span>
        </div>
        {subjects.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Palette className="mb-3 h-8 w-8 opacity-40" />
            Aucune matière dans la bibliothèque.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const subjectColor = subject.color ?? "#94a3b8";
              return (
                <div
                  key={subject.id}
                  className="group flex items-center justify-between rounded-2xl border border-border p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: subjectColor }}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-semibold">
                      {subject.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(subject)}
                    disabled={isPending}
                    aria-label={`Supprimer ${subject.name}`}
                    className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
