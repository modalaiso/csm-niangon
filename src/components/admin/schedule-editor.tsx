"use client";

import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  addScheduleRow,
  type ClassScheduleData,
  deleteScheduleRow,
  getClassSchedule,
  moveScheduleRow,
  type SubjectSummary,
  setScheduleCell,
  updateScheduleRow,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEKDAYS } from "@/lib/schedules";

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

const NONE_VALUE = "__none__";

export function ScheduleEditor(props: Readonly<ScheduleEditorProps>) {
  const [schedule, setSchedule] = useState(props.initialSchedule);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    startTransition(async () => {
      const fresh = await getClassSchedule(props.classId);
      if (fresh) setSchedule(fresh);
    });
  };

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

  const handleCellChange = (
    rowId: string,
    day: (typeof WEEKDAYS)[number],
    value: string,
  ) => {
    const subjectId = value === NONE_VALUE ? null : value;
    startTransition(async () => {
      const result = await setScheduleCell(rowId, day, subjectId);
      if ("error" in result) {
        setError("Impossible de mettre à jour cette case.");
        return;
      }
      reload();
    });
  };

  return (
    <div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
                    return (
                      <td key={day} className="px-3 py-2">
                        <Select
                          value={cell?.subjectId ?? NONE_VALUE}
                          onValueChange={(value) =>
                            handleCellChange(row.id, day, value)
                          }
                        >
                          <SelectTrigger className="h-9 w-40 bg-white text-xs">
                            <SelectValue placeholder="Vide" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>Vide</SelectItem>
                            {props.subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
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
  );
}
