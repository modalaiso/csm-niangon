"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { ModerationAction } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  listModerationKeywords,
  addModerationKeyword,
  toggleModerationKeyword,
  deleteModerationKeyword,
  type ModerationKeywordRow,
} from "@/app/actions/moderation";

const ACTION_OPTIONS: { value: ModerationAction; label: string; hint: string }[] = [
  {
    value: "AUTO_DELETE",
    label: "Supprimer automatiquement",
    hint: "Le commentaire n'est jamais publié, sans notification à l'auteur.",
  },
  {
    value: "FLAG_FOR_REVIEW",
    label: "Signaler pour revue",
    hint: "Le commentaire est masqué et mis en file d'attente pour validation manuelle.",
  },
];

export function ModerationKeywordsPanel() {
  const [keywords, setKeywords] = useState<ModerationKeywordRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phrase, setPhrase] = useState("");
  const [action, setAction] = useState<ModerationAction>("AUTO_DELETE");
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setIsLoading(true);
    listModerationKeywords()
      .then((result) => {
        if ("error" in result) {
          setError("Impossible de charger les mots-clés.");
          return;
        }
        setError(null);
        setKeywords(result.keywords);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleAdd = () => {
    if (!phrase.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addModerationKeyword(phrase, action);
      if ("error" in result) {
        if (result.error === "duplicate") setError("Ce mot-clé existe déjà.");
        else if (result.error === "invalid") setError("Le mot-clé doit contenir au moins 2 caractères.");
        else setError("Impossible d'ajouter ce mot-clé.");
        return;
      }
      setPhrase("");
      load();
    });
  };

  const handleToggle = (keyword: ModerationKeywordRow) => {
    startTransition(async () => {
      await toggleModerationKeyword(keyword.id, !keyword.isActive);
      load();
    });
  };

  const handleDelete = (keyword: ModerationKeywordRow) => {
    if (!window.confirm(`Supprimer le mot-clé "${keyword.phrase}" ?`)) return;
    startTransition(async () => {
      await deleteModerationKeyword(keyword.id);
      load();
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-sm font-semibold text-foreground">Mots-clés surveillés</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Tout commentaire contenant l&apos;un de ces mots ou phrases (insensible à la casse) déclenche
        l&apos;action choisie, automatiquement, à la publication.
      </p>

      {/* Formulaire d'ajout */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Mot ou phrase à surveiller..."
          className="flex-1"
        />
        <Select value={action} onValueChange={(v) => setAction(v as ModerationAction)}>
          <SelectTrigger className="w-full bg-white sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={handleAdd} disabled={isPending || !phrase.trim()} className="gap-1.5 text-white">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {ACTION_OPTIONS.find((o) => o.value === action)?.hint}
      </p>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {/* Liste */}
      <div className="mt-5">
        {(() => {
          if (isLoading) {
            return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
          }

          if (keywords.length === 0) {
            return <p className="text-sm text-muted-foreground">Aucun mot-clé configuré pour le moment.</p>;
          }

          return (
            <ul className="divide-y divide-border">
              {keywords.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", !k.isActive && "text-muted-foreground line-through")}>
                      {k.phrase}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        k.action === "AUTO_DELETE" ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {k.action === "AUTO_DELETE" ? "Suppression auto" : "Revue manuelle"}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(k)}
                      disabled={isPending}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        k.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {k.isActive ? "Actif" : "Inactif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(k)}
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
          );
        })()}
      </div>
    </div>
  );
}