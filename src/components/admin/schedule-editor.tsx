"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  Clock3,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  addScheduleRow,
  type ClassScheduleData,
  createSubject,
  deleteScheduleRow,
  deleteSubject,
  getClassSchedule,
  moveScheduleCell,
  type SubjectSummary,
  setScheduleCell,
  setSchedulePublished,
  updateScheduleRow,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WEEKDAYS } from "@/lib/schedules";
import { cn } from "@/lib/utils";

interface ScheduleEditorProps {
  classId: string;
  initialSchedule: ClassScheduleData;
  subjects: SubjectSummary[];
}

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
};

const FALLBACK_COLOR = "#94a3b8";

const PALETTE = [
  "#42AA4A",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#EF4444",
  "#F97316",
  "#6366F1",
  "#10B981",
];

type Tab = "grille" | "matieres";
type Weekday = (typeof WEEKDAYS)[number];

/** Choisit un texte clair ou foncé selon la luminosité de la couleur de fond */
function textColorFor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#ffffff";
  const r = Number.parseInt(c.slice(0, 2), 16);
  const g = Number.parseInt(c.slice(2, 4), 16);
  const b = Number.parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

export function ScheduleEditor(props: Readonly<ScheduleEditorProps>) {
  const [schedule, setSchedule] = useState(props.initialSchedule);
  const [subjects, setSubjects] = useState(props.subjects);
  const [tab, setTab] = useState<Tab>("grille");

  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState(PALETTE[0]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    day: Weekday;
  } | null>(null);
  const [targetRowId, setTargetRowId] = useState("");
  const [targetDay, setTargetDay] = useState<Weekday>("LUNDI");
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [selectedDay, setSelectedDay] = useState<Weekday>("LUNDI");
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = async () => {
    try {
      const fresh = await getClassSchedule(props.classId);
      if (!fresh) {
        setError("Le planning n'est plus accessible. Actualisez la page.");
        return;
      }
      setSchedule(fresh);
    } catch (reloadError) {
      console.error(
        "Erreur lors du rechargement de l'emploi du temps:",
        reloadError,
      );
      setError(
        "Impossible de recharger le planning. Vos changements sont enregistrés.",
      );
    }
  };

  /* --------------------------------- Lignes --------------------------------- */

  const handleAddRow = () => {
    if (!newStart.trim() || !newEnd.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addScheduleRow(props.classId, newStart, newEnd);
      if ("error" in result) {
        setError(result.message ?? "Impossible d'ajouter ce créneau.");
        return;
      }
      setNewStart("");
      setNewEnd("");
      setNotice("Créneau ajouté.");
      await reload();
    });
  };

  const handleUpdateRowTime = (
    rowId: string,
    startTime: string,
    endTime: string,
  ) => {
    startTransition(async () => {
      const result = await updateScheduleRow(rowId, startTime, endTime);
      if ("error" in result) {
        setError(result.message ?? "Impossible de modifier ce créneau.");
        return;
      }
      setNotice("Créneau modifié.");
      await reload();
    });
  };

  const handleDeleteRow = (rowId: string) => {
    if (!window.confirm("Supprimer cette ligne horaire et toutes ses cases ?"))
      return;
    startTransition(async () => {
      const result = await deleteScheduleRow(rowId);
      if ("error" in result) {
        setError(result.message ?? "Impossible de supprimer ce créneau.");
        return;
      }
      setNotice("Créneau supprimé.");
      await reload();
    });
  };

  /* -------------------------------- Cases -------------------------------- */

  const assignCell = (
    rowId: string,
    day: Weekday,
    subjectId: string | null,
  ) => {
    startTransition(async () => {
      const result = await setScheduleCell(rowId, day, subjectId);
      if ("error" in result) {
        setError(result.message ?? "Impossible d'enregistrer cette séance.");
        return;
      }
      setEditingCell(null);
      setSelectedSubjectId(null);
      setNotice(subjectId ? "Séance enregistrée." : "Séance supprimée.");
      await reload();
    });
  };

  const handleCellClick = (rowId: string, day: Weekday) => {
    if (selectedSubjectId) {
      assignCell(rowId, day, selectedSubjectId);
      return;
    }
    const row = schedule.rows.find((item) => item.id === rowId);
    const cell = row?.cells.find((item) => item.day === day);
    setEditingCell({ rowId, day });
    setTargetRowId(rowId);
    setTargetDay(day);
    setEditingSubjectId(cell?.subjectId ?? "");
    setError(null);
    setNotice(null);
  };

  const handleCellClear = (rowId: string, day: Weekday) => {
    if (!window.confirm("Supprimer cette séance du planning ?")) return;
    assignCell(rowId, day, null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    rowId: string,
    day: Weekday,
  ) => {
    e.preventDefault();
    setDragOverCell(null);
    const subjectId = e.dataTransfer.getData("text/subject-id");
    if (subjectId) assignCell(rowId, day, subjectId);
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    if (!editingSubjectId) {
      setError("Sélectionnez une matière pour enregistrer la séance.");
      return;
    }
    if (editingCell.rowId === targetRowId && editingCell.day === targetDay) {
      assignCell(targetRowId, targetDay, editingSubjectId);
      return;
    }

    startTransition(async () => {
      const result = await moveScheduleCell(
        editingCell.rowId,
        editingCell.day,
        targetRowId,
        targetDay,
        editingSubjectId,
      );
      if ("error" in result) {
        setError(result.message ?? "Impossible de déplacer cette séance.");
        return;
      }
      setEditingCell(null);
      setSelectedSubjectId(null);
      setNotice("Séance déplacée.");
      await reload();
    });
  };

  const handleSetPublished = (published: boolean) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await setSchedulePublished(props.classId, published);
      if ("error" in result) {
        setError(result.message ?? "Impossible de modifier la publication.");
        return;
      }
      setNotice(published ? "Emploi du temps publié." : "Publication retirée.");
      await reload();
    });
  };

  /* ------------------------------- Matières ------------------------------- */

  const handleAddSubject = () => {
    if (!subjectName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createSubject(subjectName, subjectColor);
      if ("error" in result) {
        setError(
          result.error === "duplicate"
            ? "Cette matière existe déjà."
            : (result.message ?? "Impossible de créer cette matière."),
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
        setError("Impossible de supprimer cette matière.");
        return;
      }
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      if (selectedSubjectId === subject.id) setSelectedSubjectId(null);
      await reload();
    });
  };

  /* --------------------------------- Rendu --------------------------------- */

  const subjectPalette = (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Matières disponibles
        </h3>
        {selectedSubjectId && (
          <button
            type="button"
            onClick={() => setSelectedSubjectId(null)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Désélectionner
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Glissez une matière sur une case de la grille, ou sélectionnez-la puis
        cliquez sur une case.
      </p>
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune matière. Ajoutez-en depuis l'onglet « Matières ».
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => {
            const color = s.color ?? FALLBACK_COLOR;
            const isSelected = selectedSubjectId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/subject-id", s.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() =>
                  setSelectedSubjectId((prev) => (prev === s.id ? null : s.id))
                }
                style={{ backgroundColor: color, color: textColorFor(color) }}
                className={cn(
                  "flex cursor-grab items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                )}
              >
                <GripVertical className="h-3.5 w-3.5 opacity-70" />
                {s.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {schedule.publishedAt ? "Planning publié" : "Brouillon"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {schedule.publishedAt
              ? `Visible par les comptes associés à cette classe depuis le ${schedule.publishedAt.toLocaleDateString("fr-FR")}.`
              : "Le planning reste privé jusqu'à sa publication."}
          </p>
        </div>
        <Button
          type="button"
          variant={schedule.publishedAt ? "outline" : "default"}
          disabled={isPending}
          onClick={() => handleSetPublished(!schedule.publishedAt)}
          className="w-full gap-2 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : schedule.publishedAt ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {schedule.publishedAt ? "Retirer la publication" : "Publier"}
        </Button>
      </section>

      {/* Tabs */}
      <div className="flex w-fit items-center gap-1 rounded-lg border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => setTab("grille")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "grille"
              ? "bg-primarys2-700 text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Grille
        </button>
        <button
          type="button"
          onClick={() => setTab("matieres")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "matieres"
              ? "bg-primarys2-700 text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Matières
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <output className="mb-3 flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" />
          {notice}
        </output>
      )}

      {tab === "matieres" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Ajouter une matière
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                placeholder="Ex : Mathématiques"
                className="flex-1"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSubjectColor(color)}
                    aria-label={`Choisir la couleur ${color}`}
                    style={{ backgroundColor: color }}
                    className={cn(
                      "h-7 w-7 flex-shrink-0 rounded-full border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      subjectColor === color
                        ? "border-foreground"
                        : "border-transparent",
                    )}
                  />
                ))}
              </div>
              <Button
                type="button"
                onClick={handleAddSubject}
                disabled={isPending || !subjectName.trim()}
                className="gap-1.5 rounded-md bg-primarys2-700 text-white hover:bg-primarys2-800"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
              Liste des matières
            </h2>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune matière pour le moment.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const color = s.color ?? FALLBACK_COLOR;
                  return (
                    <li key={s.id}>
                      <span
                        style={{ backgroundColor: `${color}1A`, color }}
                        className="flex items-center gap-2 rounded-md py-1 pl-3 pr-1 text-xs font-semibold"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {s.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(s)}
                          disabled={isPending}
                          aria-label={`Supprimer ${s.name}`}
                          className="rounded-md p-1 hover:bg-black/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-end">
            <div>
              <label
                className="mb-1 block text-xs font-medium text-muted-foreground"
                htmlFor="new-start"
              >
                Début du créneau
              </label>
              <Input
                id="new-start"
                placeholder="07:30"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full sm:w-32"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-muted-foreground"
                htmlFor="new-end"
              >
                Fin du créneau
              </label>
              <Input
                id="new-end"
                placeholder="08:25"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full sm:w-32"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddRow}
              disabled={isPending || !newStart.trim() || !newEnd.trim()}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Ajouter un créneau
            </Button>
            <p className="text-xs text-muted-foreground sm:ml-auto sm:max-w-sm">
              Les horaires restent enregistrés comme créneaux de cette classe et
              sont réutilisés pour ses séances.
            </p>
          </section>

          <div className="md:hidden rounded-xl border border-border bg-background p-3">
            <fieldset className="mb-3 grid grid-cols-5 gap-1">
              <legend className="sr-only">Choisir le jour à afficher</legend>
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selectedDay === day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-10 rounded-md px-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedDay === day
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </button>
              ))}
            </fieldset>
            {schedule.rows.length === 0 ? (
              <p className="py-5 text-center text-sm text-muted-foreground">
                Aucun créneau pour cette classe. Ajoutez-en ci-dessus.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {schedule.rows.map((row) => {
                  const cell = row.cells.find(
                    (item) => item.day === selectedDay,
                  );
                  const color = cell?.subjectColor ?? FALLBACK_COLOR;
                  return (
                    <li key={row.id} className="py-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                          {row.startTime} – {row.endTime}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          disabled={isPending}
                          aria-label={`Supprimer le créneau ${row.startTime}–${row.endTime}`}
                          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <details className="mb-2">
                        <summary className="min-h-10 cursor-pointer py-2 text-xs font-medium text-muted-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          Modifier les horaires
                        </summary>
                        <div className="grid grid-cols-2 gap-2">
                          <label
                            htmlFor={`mobile-start-${row.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Début
                            <Input
                              key={`mobile-start-${row.id}-${row.startTime}`}
                              id={`mobile-start-${row.id}`}
                              defaultValue={row.startTime}
                              aria-label={`Début du créneau ${row.startTime}–${row.endTime}`}
                              onBlur={(event) => {
                                if (event.target.value !== row.startTime) {
                                  handleUpdateRowTime(
                                    row.id,
                                    event.target.value,
                                    row.endTime,
                                  );
                                }
                              }}
                              className="mt-1"
                            />
                          </label>
                          <label
                            htmlFor={`mobile-end-${row.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Fin
                            <Input
                              key={`mobile-end-${row.id}-${row.endTime}`}
                              id={`mobile-end-${row.id}`}
                              defaultValue={row.endTime}
                              aria-label={`Fin du créneau ${row.startTime}–${row.endTime}`}
                              onBlur={(event) => {
                                if (event.target.value !== row.endTime) {
                                  handleUpdateRowTime(
                                    row.id,
                                    row.startTime,
                                    event.target.value,
                                  );
                                }
                              }}
                              className="mt-1"
                            />
                          </label>
                        </div>
                      </details>
                      <button
                        type="button"
                        onClick={() => handleCellClick(row.id, selectedDay)}
                        disabled={isPending}
                        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {cell?.subjectName ? (
                          <span
                            style={{
                              backgroundColor: `${color}1A`,
                              color,
                            }}
                            className="font-semibold"
                          >
                            {cell.subjectName}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Séance non renseignée
                          </span>
                        )}
                        <span className="text-xs font-medium text-primary">
                          {cell?.subjectName ? "Modifier" : "Ajouter"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="hidden grid-cols-1 gap-4 md:grid lg:grid-cols-[1fr_260px]">
            {/* Grille */}
            <div className="overflow-x-auto rounded-xl border border-border bg-background">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-3">Horaires</th>
                    {WEEKDAYS.map((day) => (
                      <th key={day} className="px-3 py-3">
                        {DAY_LABELS[day]}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedule.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Aucune ligne horaire. Ajoutez-en une ci-dessous.
                      </td>
                    </tr>
                  ) : (
                    schedule.rows.map((row) => (
                      <tr key={row.id} className="align-middle">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              key={`start-${row.id}-${row.startTime}`}
                              defaultValue={row.startTime}
                              aria-label={`Début du créneau ${row.startTime}–${row.endTime}`}
                              placeholder="HH:MM"
                              onBlur={(e) => {
                                if (e.target.value !== row.startTime) {
                                  handleUpdateRowTime(
                                    row.id,
                                    e.target.value,
                                    row.endTime,
                                  );
                                }
                              }}
                              className="w-20"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              key={`end-${row.id}-${row.endTime}`}
                              defaultValue={row.endTime}
                              aria-label={`Fin du créneau ${row.startTime}–${row.endTime}`}
                              placeholder="HH:MM"
                              onBlur={(e) => {
                                if (e.target.value !== row.endTime) {
                                  handleUpdateRowTime(
                                    row.id,
                                    row.startTime,
                                    e.target.value,
                                  );
                                }
                              }}
                              className="w-20"
                            />
                          </div>
                        </td>
                        {WEEKDAYS.map((day) => {
                          const cell = row.cells.find((c) => c.day === day);
                          const color = cell?.subjectColor ?? FALLBACK_COLOR;
                          const cellKey = `${row.id}-${day}`;
                          const isDragOver = dragOverCell === cellKey;

                          return (
                            <td
                              key={day}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverCell(cellKey);
                              }}
                              onDragLeave={() =>
                                setDragOverCell((prev) =>
                                  prev === cellKey ? null : prev,
                                )
                              }
                              onDrop={(e) => handleDrop(e, row.id, day)}
                              className={cn(
                                "px-2 py-2 align-top transition-colors",
                                selectedSubjectId && "cursor-copy",
                                isDragOver && "bg-primary/10",
                              )}
                            >
                              <div className="group relative">
                                <button
                                  type="button"
                                  onClick={() => handleCellClick(row.id, day)}
                                  disabled={isPending}
                                  aria-label={`${DAY_LABELS[day]}, ${row.startTime}–${row.endTime}: ${cell?.subjectName ?? "vide"}${selectedSubjectId ? ". Appliquer la matière sélectionnée." : ". Modifier la séance."}`}
                                  className="flex min-h-[44px] w-full items-center justify-center rounded-md px-2 py-2 text-center text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                  style={
                                    cell?.subjectName
                                      ? {
                                          backgroundColor: color,
                                          color: textColorFor(color),
                                        }
                                      : undefined
                                  }
                                >
                                  {cell?.subjectName ?? (
                                    <span className="font-normal text-muted-foreground">
                                      Ajouter
                                    </span>
                                  )}
                                </button>
                                {cell?.subjectName && (
                                  <button
                                    type="button"
                                    onClick={() => handleCellClear(row.id, day)}
                                    disabled={isPending}
                                    aria-label={`Supprimer ${cell.subjectName}, ${DAY_LABELS[day]} ${row.startTime}–${row.endTime}`}
                                    className="absolute -right-1.5 -top-1.5 hidden h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white group-hover:flex focus-visible:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              disabled={isPending}
                              aria-label="Supprimer"
                              className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Palette de matières (draggable) */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              {subjectPalette}
            </div>
          </div>
        </div>
      )}

      <Dialog.Root
        open={editingCell !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setEditingCell(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] w-full overflow-y-auto rounded-t-xl border border-border bg-background p-5 shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {editingCell &&
              schedule.rows
                .find((row) => row.id === editingCell.rowId)
                ?.cells.find((cell) => cell.day === editingCell.day)
                ?.subjectName
                ? "Modifier la séance"
                : "Ajouter une séance"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {editingCell && (
                <>
                  {schedule.className} · {DAY_LABELS[editingCell.day]} ·{" "}
                  {
                    schedule.rows.find((row) => row.id === editingCell.rowId)
                      ?.startTime
                  }
                  –
                  {
                    schedule.rows.find((row) => row.id === editingCell.rowId)
                      ?.endTime
                  }
                </>
              )}
            </Dialog.Description>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                htmlFor="schedule-target-day"
                className="text-sm font-medium text-foreground"
              >
                Jour
                <select
                  id="schedule-target-day"
                  value={targetDay}
                  onChange={(event) => {
                    const day = WEEKDAYS.find(
                      (weekday) => weekday === event.target.value,
                    );
                    if (day) setTargetDay(day);
                  }}
                  className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </label>
              <label
                htmlFor="schedule-target-slot"
                className="text-sm font-medium text-foreground"
              >
                Créneau
                <select
                  id="schedule-target-slot"
                  value={targetRowId}
                  onChange={(event) => setTargetRowId(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {schedule.rows.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.startTime}–{row.endTime}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label
              htmlFor="schedule-subject"
              className="mt-4 block text-sm font-medium text-foreground"
            >
              Matière
            </label>
            <select
              id="schedule-subject"
              value={editingSubjectId}
              onChange={(event) => setEditingSubjectId(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sélectionner une matière</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="flex-1 sm:flex-none"
                  >
                    Annuler
                  </Button>
                </Dialog.Close>
                {editingCell &&
                  schedule.rows
                    .find((row) => row.id === editingCell.rowId)
                    ?.cells.find((cell) => cell.day === editingCell.day)
                    ?.subjectId && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        handleCellClear(editingCell.rowId, editingCell.day)
                      }
                      disabled={isPending}
                      className="flex-1 sm:flex-none"
                    >
                      Supprimer
                    </Button>
                  )}
              </div>
              <Button
                type="button"
                onClick={handleSaveCell}
                disabled={
                  isPending || !editingSubjectId || subjects.length === 0
                }
                className="flex-1 sm:flex-none"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
