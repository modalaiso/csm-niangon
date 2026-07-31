"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Loader2 } from "lucide-react";
import {
  listFlaggedComments,
  approveFlaggedComment,
  rejectFlaggedComment,
  type FlaggedCommentRow,
} from "@/app/actions/moderation";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ModerationQueue() {
  const [comments, setComments] = useState<FlaggedCommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setIsLoading(true);
    listFlaggedComments()
      .then((result) => {
        if ("error" in result) {
          setError("Impossible de charger la file de modération.");
          return;
        }
        setError(null);
        setComments(result.comments);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveFlaggedComment(id);
      load();
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectFlaggedComment(id);
      load();
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl border border-border bg-white p-5 text-sm text-destructive">{error}</p>;
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Aucun commentaire en attente de revue.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/posts/${comment.postId}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {comment.postTitle}
            </Link>
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>

          <p className="mt-2 text-sm text-foreground">{comment.content}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Par {comment.author.prenom} {comment.author.nom}
            </span>
            {comment.flaggedKeyword && (
              <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                mot-clé : {comment.flaggedKeyword}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApprove(comment.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Approuver
            </button>
            <button
              type="button"
              onClick={() => handleReject(comment.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Rejeter
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}