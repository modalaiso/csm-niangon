"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, User, MessageCircle } from "lucide-react";
import { addComment, type PostComment } from "@/app/actions/comments";

interface CommentSectionProps {
  postId: string;
  comments: PostComment[];
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months}m`;
  const years = Math.floor(months / 12);
  return `Il y a ${years}an${years > 1 ? "s" : ""}`;
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!value.trim() || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await addComment(postId, value);
      if ("error" in result) {
        if (result.error === "auth_required") {
          router.push("/login");
          return;
        }
        setError("Une erreur est survenue, réessayez.");
        return;
      }
      setValue("");
      router.refresh();
    });
  };

  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-foreground">
        <MessageCircle className="h-5 w-5 text-primary" />
        Commentaires ({comments.length})
      </h2>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-input bg-background pl-4 pr-1.5">
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Écrire un commentaire..."
            className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !value.trim()}
            aria-label="Envoyer le commentaire"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive">{error}</p>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.author.prenom} {comment.author.nom}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{comment.author.username} · {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}