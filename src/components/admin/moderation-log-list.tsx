"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { listModerationLogs, type ModerationLogRow } from "@/app/actions/moderation";

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  AUTO_DELETED: { label: "Auto-supprimé", className: "bg-destructive/10 text-destructive" },
  FLAGGED: { label: "Signalé", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuvé", className: "bg-primary/10 text-primary" },
  REJECTED: { label: "Rejeté", className: "bg-slate-100 text-slate-600" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ModerationLogList() {
  const [logs, setLogs] = useState<ModerationLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listModerationLogs(50)
      .then((result) => {
        if (!("error" in result)) setLogs(result.logs);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">Aucune action de modération enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <ul className="divide-y divide-border">
        {logs.map((log) => {
          const badge = TYPE_BADGES[log.type] ?? { label: log.type, className: "bg-gray-100 text-gray-600" };
          return (
            <li key={log.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.className)}>
                  {badge.label}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-foreground">{log.content}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                {log.matchedKeyword && <span>Mot-clé : {log.matchedKeyword}</span>}
                {log.postTitle && <span>Post : {log.postTitle}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}