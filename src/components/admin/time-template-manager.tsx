"use client";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  createScheduleTimeTemplate,
  deleteScheduleTimeTemplate,
  moveScheduleTimeTemplate,
  type ScheduleTimeTemplateData,
  updateScheduleTimeTemplate,
} from "@/app/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TimeTemplateManager(
  props: Readonly<{
    initialTemplates: ScheduleTimeTemplateData[];
    initialSchoolYear: string;
  }>,
) {
  const [templates, setTemplates] = useState(props.initialTemplates);
  const [year, setYear] = useState(props.initialSchoolYear);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, transition] = useTransition();

  const add = () => {
    if (!start.trim() || !end.trim()) return;
    transition(async () => {
      const result = await createScheduleTimeTemplate(year, start, end);
      if ("error" in result)
        return setError("Impossible d’ajouter ce créneau.");
      setTemplates((items) => [
        ...items,
        {
          id: result.id,
          schoolYear: year,
          startTime: start.trim(),
          endTime: end.trim(),
          position: items.length,
        },
      ]);
      setStart(end);
      setEnd("");
      setNotice("Créneau ajouté au modèle annuel.");
    });
  };
  const update = (
    item: ScheduleTimeTemplateData,
    nextStart: string,
    nextEnd: string,
  ) =>
    transition(async () => {
      const result = await updateScheduleTimeTemplate(
        item.id,
        nextStart,
        nextEnd,
      );
      if ("error" in result)
        return setError("Impossible de modifier ce créneau.");
      setTemplates((items) =>
        items.map((entry) =>
          entry.id === item.id
            ? { ...entry, startTime: nextStart, endTime: nextEnd }
            : entry,
        ),
      );
    });
  const move = (item: ScheduleTimeTemplateData, direction: "up" | "down") =>
    transition(async () => {
      const result = await moveScheduleTimeTemplate(item.id, direction);
      if ("error" in result)
        return setError("Impossible de déplacer ce créneau.");
      setTemplates((items) => {
        const index = items.findIndex((entry) => entry.id === item.id);
        const target = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || target < 0 || target >= items.length) return items;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        return next.map((entry, position) => ({ ...entry, position }));
      });
    });
  const remove = (item: ScheduleTimeTemplateData) => {
    if (!window.confirm("Supprimer ce créneau du modèle annuel ?")) return;
    transition(async () => {
      const result = await deleteScheduleTimeTemplate(item.id);
      if ("error" in result)
        return setError("Impossible de supprimer ce créneau.");
      setTemplates((items) => items.filter((entry) => entry.id !== item.id));
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_330px]">
      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Modèle annuel
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Créneaux de la journée
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ces horaires préremplissent automatiquement chaque nouvel emploi
              du temps.
            </p>
          </div>
          <Clock3 className="h-6 w-6 text-primary" />
        </div>
        <div className="mt-5 space-y-2">
          {templates.map((item, index) => (
            <button
              key={item.id}
              type="button"
              draggable
              onDragStart={(event) =>
                event.dataTransfer.setData("template-id", item.id)
              }
              className="group flex flex-col gap-3 rounded-2xl border border-border p-3 sm:flex-row sm:items-center"
            >
              <GripVertical className="hidden h-4 w-4 cursor-grab text-muted-foreground sm:block" />
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <Input
                  defaultValue={item.startTime}
                  aria-label={`Début du créneau ${index + 1}`}
                  onBlur={(event) =>
                    event.target.value !== item.startTime &&
                    update(item, event.target.value, item.endTime)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">à</span>
                <Input
                  defaultValue={item.endTime}
                  aria-label={`Fin du créneau ${index + 1}`}
                  onBlur={(event) =>
                    event.target.value !== item.endTime &&
                    update(item, item.startTime, event.target.value)
                  }
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-1 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => move(item, "up")}
                  disabled={!index || pending}
                  aria-label="Monter"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(item, "down")}
                  disabled={index === templates.length - 1 || pending}
                  aria-label="Descendre"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label="Supprimer"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.03] p-4">
          <p className="text-sm font-semibold">Ajouter un créneau</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label
                htmlFor="template-start"
                className="block text-xs font-medium text-muted-foreground"
              >
                Début
              </label>
              <Input
                id="template-start"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                placeholder="07:30"
                className="mt-1 w-28"
              />
            </div>
            <div>
              <label
                htmlFor="template-end"
                className="block text-xs font-medium text-muted-foreground"
              >
                Fin
              </label>
              <Input
                id="template-end"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                placeholder="08:25"
                className="mt-1 w-28"
              />
            </div>
            <Button
              type="button"
              onClick={add}
              disabled={pending || !start.trim() || !end.trim()}
              className="gap-2 text-white"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Ajouter
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <output className="mt-3 block text-sm text-primary">{notice}</output>
        )}
      </section>
      <aside className="h-fit rounded-3xl border border-border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Année scolaire
        </p>
        <h2 className="mt-1 font-semibold">Modèle actif</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Changer l’année crée un modèle indépendant.
        </p>
        <Input
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="mt-4"
          aria-label="Année scolaire"
        />
        <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">
          Les nouvelles classes de cette année récupèrent ces créneaux
          automatiquement.
        </div>
      </aside>
    </div>
  );
}
