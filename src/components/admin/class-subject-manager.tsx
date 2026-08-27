"use client";

import { CalendarClock, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  type ClassSummary,
  createClass,
  createSubject,
  deleteClass,
  deleteSubject,
  type SubjectSummary,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClassSubjectManagerProps {
  initialClasses: ClassSummary[];
  initialSubjects: SubjectSummary[];
}

export function ClassSubjectManager(props: Readonly<ClassSubjectManagerProps>) {
  const [classes, setClasses] = useState(props.initialClasses);
  const [subjects, setSubjects] = useState(props.initialSubjects);

  const [className, setClassName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [classError, setClassError] = useState<string | null>(null);

  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState("#42AA4A");
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleAddClass = () => {
    if (!className.trim()) return;
    setClassError(null);
    startTransition(async () => {
      const result = await createClass(className, classLevel, schoolYear);
      if ("error" in result) {
        setClassError(
          result.error === "duplicate"
            ? "Cette classe existe déjà."
            : "Impossible de créer cette classe.",
        );
        return;
      }
      setClasses((prev) =>
        [
          ...prev,
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

  const handleDeleteClass = (classItem: ClassSummary) => {
    if (
      !window.confirm(
        `Supprimer la classe "${classItem.name}" et son emploi du temps ?`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteClass(classItem.id);
      if ("error" in result) {
        setClassError("Impossible de supprimer cette classe.");
        return;
      }
      setClasses((prev) => prev.filter((c) => c.id !== classItem.id));
    });
  };

  const handleAddSubject = () => {
    if (!subjectName.trim()) return;
    setSubjectError(null);
    startTransition(async () => {
      const result = await createSubject(subjectName, subjectColor);
      if ("error" in result) {
        setSubjectError(
          result.error === "duplicate"
            ? "Cette matière existe déjà."
            : "Impossible de créer cette matière.",
        );
        return;
      }
      setSubjects((prev) =>
        [
          ...prev,
          { id: result.id, name: subjectName.trim(), color: subjectColor },
        ].sort((a, b) => a.name.localeCompare(b.name, "fr")),
      );
      setSubjectName("");
    });
  };

  const handleDeleteSubject = (subject: SubjectSummary) => {
    if (!window.confirm(`Supprimer la matière "${subject.name}" ?`)) return;
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if ("error" in result) {
        setSubjectError("Impossible de supprimer cette matière.");
        return;
      }
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Classes */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-foreground">Classes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Créez une classe, puis modifiez son emploi du temps depuis la liste
          ci-dessous.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Ex : 1ère D1"
            className="flex-1"
          />
          <Input
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            placeholder="Niveau (optionnel)"
            className="sm:w-40"
          />
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            placeholder="Année scolaire"
            className="sm:w-40"
          />
          <Button
            type="button"
            onClick={handleAddClass}
            disabled={isPending || !className.trim()}
            className="gap-1.5 text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
        {classError && (
          <p className="mt-2 text-sm text-destructive">{classError}</p>
        )}

        <ul className="mt-4 divide-y divide-border">
          {classes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune classe pour le moment.
            </p>
          )}
          {classes.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.level ?? "—"} · {c.schoolYear}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/admin/schedules/${c.id}`}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  Emploi du temps
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteClass(c)}
                  disabled={isPending}
                  aria-label="Supprimer"
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Matières */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-foreground">Matières</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          La liste des matières disponibles pour remplir les emplois du temps.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Ex : Mathématiques"
            className="flex-1"
          />
          <input
            type="color"
            value={subjectColor}
            onChange={(e) => setSubjectColor(e.target.value)}
            aria-label="Couleur de la matière"
            className="h-10 w-12 flex-shrink-0 cursor-pointer rounded-xl border border-input"
          />
          <Button
            type="button"
            onClick={handleAddSubject}
            disabled={isPending || !subjectName.trim()}
            className="gap-1.5 text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
        {subjectError && (
          <p className="mt-2 text-sm text-destructive">{subjectError}</p>
        )}

        <ul className="mt-4 flex flex-wrap gap-2">
          {subjects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune matière pour le moment.
            </p>
          )}
          {subjects.map((s) => (
            <li key={s.id}>
              <span className="flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1 text-xs font-medium text-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color ?? "#94a3b8" }}
                />
                {s.name}
                <button
                  type="button"
                  onClick={() => handleDeleteSubject(s)}
                  disabled={isPending}
                  aria-label={`Supprimer ${s.name}`}
                  className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
