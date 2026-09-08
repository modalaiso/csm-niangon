"use client";

import {
  ArrowDown,
  ArrowUp,
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
  moveScheduleRow,
  setScheduleCell,
  type SubjectSummary,
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
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
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
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    startTransition(async () => {
      const fresh = await getClassSchedule(props.classId);
      if (fresh) setSchedule(fresh);
    });
  };

  /* --------------------------------- Lignes --------------------------------- */

  const handleAddRow = () => {
    if (!newStart.trim() || !newEnd.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addScheduleRow(props.classId, newStart, newEnd);
      if ("error" in result) {
        setError("Impossible d'ajouter cette ligne horaire.");
        return;
      }
      setNewStart("");
      setNewEnd("");
      reload();
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
        setError("Impossible de modifier cet horaire.");
        return;
      }
      reload();
    });
  };

  const handleDeleteRow = (rowId: string) => {
    if (!window.confirm("Supprimer cette ligne horaire et toutes ses cases ?"))
      return;
    startTransition(async () => {
      const result = await deleteScheduleRow(rowId);
      if ("error" in result) {
        setError("Impossible de supprimer cette ligne.");
        return;
      }
      reload();
    });
  };

  const handleMoveRow = (rowId: string, direction: "up" | "down") => {
    startTransition(async () => {
      await moveScheduleRow(rowId, direction);
      reload();
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
        setError("Impossible de mettre à jour cette case.");
        return;
      }
      reload();
    });
  };

  const handleCellClick = (rowId: string, day: Weekday) => {
    if (!selectedSubjectId) return;
    assignCell(rowId, day, selectedSubjectId);
  };

  const handleCellClear = (rowId: string, day: Weekday) => {
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
        setError("Impossible de supprimer cette matière.");
        return;
      }
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      if (selectedSubjectId === subject.id) setSelectedSubjectId(null);
      reload();
    });
  };

  /* --------------------------------- Rendu --------------------------------- */

  const subjectPalette = (
    <div className="rounded-3xl border border-border bg-white p-4">
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
                  "flex cursor-grab items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform active:cursor-grabbing",
                  isSelected && "scale-105 ring-2 ring-primary ring-offset-2",
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
    <div>
      {/* Tabs */}
      <div className="mb-4 flex w-fit items-center gap-1 rounded-full bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("grille")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "grille"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          Grille
        </button>
        <button
          type="button"
          onClick={() => setTab("matieres")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "matieres"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          Matières
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {tab === "matieres" ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-foreground">
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
                      "h-7 w-7 flex-shrink-0 rounded-full border-2 transition-transform",
                      subjectColor === color
                        ? "scale-110 border-foreground"
                        : "border-transparent",
                    )}
                  />
                ))}
              </div>
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
          </div>

          <div className="rounded-3xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
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
                        className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-xs font-semibold"
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
                          className="rounded-full p-1 hover:bg-black/10"
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          {/* Grille */}
          <div className="overflow-x-auto rounded-3xl border border-border bg-white">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
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
                            defaultValue={row.startTime}
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
                            defaultValue={row.endTime}
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
                            onClick={() => handleCellClick(row.id, day)}
                            className={cn(
                              "px-2 py-2 align-top transition-colors",
                              selectedSubjectId && "cursor-copy",
                              isDragOver && "bg-primary/10",
                            )}
                          >
                            {cell?.subjectName ? (
                              <div
                                style={{
                                  backgroundColor: color,
                                  color: textColorFor(color),
                                }}
                                className="group relative flex min-h-[44px] items-center justify-center rounded-2xl px-2 py-2 text-center text-xs font-semibold"
                              >
                                {cell.subjectName}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClear(row.id, day);
                                  }}
                                  aria-label="Retirer la matière"
                                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-dashed border-border text-[11px] text-muted-foreground">
                                Vide
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveRow(row.id, "up")}
                            disabled={isPending}
                            aria-label="Monter"
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRow(row.id, "down")}
                            disabled={isPending}
                            aria-label="Descendre"
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            disabled={isPending}
                            aria-label="Supprimer"
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

            <div className="flex flex-wrap items-end gap-2 border-t border-dashed border-border bg-muted/30 p-4">
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                  htmlFor="new-start"
                >
                  Début
                </label>
                <Input
                  id="new-start"
                  placeholder="07H30"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-28"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                  htmlFor="new-end"
                >
                  Fin
                </label>
                <Input
                  id="new-end"
                  placeholder="08H25"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-28"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddRow}
                disabled={isPending || !newStart.trim() || !newEnd.trim()}
                className="gap-1.5 text-white"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Ajouter une ligne
              </Button>
            </div>
          </div>

          {/* Palette de matières (draggable) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {subjectPalette}
          </div>
        </div>
      )}
    </div>
  );
}