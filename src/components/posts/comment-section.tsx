"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Pencil,
  Trash2,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  ThumbsUpOutlineIcon,
  ThumbsUpFilledIcon,
  ThumbsDownOutlineIcon,
  ThumbsDownFilledIcon,
} from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import {
  addComment,
  editComment,
  deleteComment,
  setCommentHidden,
  toggleCommentReaction,
  type CommentThread,
  type PostComment,
} from "@/app/actions/comments";

interface CommentSectionProps {
  postId: string;
  threads: CommentThread[];
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-sky-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-slate-500",
  "bg-gray-500",
];

function colorForUsername(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

function Avatar({ nom, prenom, username, avatar }: { nom: string; prenom: string; username: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={prenom + " " + nom}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colorForUsername(username)}`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

/* ------------------------------- Menu "..." ------------------------------- */

interface CommentMenuProps {
  comment: PostComment;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
}

function CommentMenu({ comment, isOpen, onToggle, onEdit, onDelete, onToggleHidden }: CommentMenuProps) {
  if (!comment.canEdit && !comment.canDelete && !comment.canModerate) {
    return null;
  }

  return (
    <div data-comment-menu className="relative flex-shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Options du commentaire"
        aria-expanded={isOpen}
        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 xl:left-10 xl:top-0 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-white py-1 shadow-sm">
          {comment.canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text- text-foreground hover:bg-accent"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          )}
          {comment.canModerate && (
            <button
              type="button"
              onClick={onToggleHidden}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >
              {comment.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {comment.isHidden ? "Réafficher" : "Masquer"}
            </button>
          )}
          {comment.canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Champ de saisie réponse --------------------------- */

interface ComposerBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
  submitLabel: string;
  autoFocus?: boolean;
}

function ComposerBox({ value, onChange, onSubmit, onCancel, disabled, submitLabel, autoFocus }: ComposerBoxProps) {
  return (
    <div className="mt-3">
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Ajouter une réponse..."
        className="w-full border-b border-input bg-transparent pb-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Ligne de réactions -------------------------------- */

interface ReactionRowProps {
  comment: PostComment;
  onLike: () => void;
  onDislike: () => void;
  onReply: () => void;
}

function ReactionRow({ comment, onLike, onDislike, onReply }: ReactionRowProps) {
  return (
    <div className="mt-1 flex items-center gap-4">
      <button
        type="button"
        onClick={onLike}
        className={cn(
          "flex items-center gap-1.5 text-muted-foreground hover:text-primary",
          comment.userReaction === "LIKE" && "text-primary",
        )}
      >
        {comment.userReaction === "LIKE" ? (
          <ThumbsUpFilledIcon className={cn("h-4 w-4", comment.userReaction === "LIKE" && "fill-primary")} />
        ) : (
          <ThumbsUpOutlineIcon className="h-4 w-4" />
        )}
        {comment.likeCount > 0 && <span className="text-xs">{comment.likeCount}</span>}
      </button>
      <button
        type="button"
        onClick={onDislike}
        className={cn(
          "text-muted-foreground hover:text-primary",
          comment.userReaction === "DISLIKE" && "text-primary",
        )}
      >
        {comment.userReaction === "DISLIKE" ? (
          <ThumbsDownFilledIcon className={cn("h-4 w-4", comment.userReaction === "DISLIKE" && "fill-primary")} />
        ) : (
          <ThumbsDownOutlineIcon className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onReply}
        className="text-xs font-semibold text-primary hover:underline"
      >
        Répondre
      </button>
    </div>
  );
}

/* --------------------------------- Un commentaire --------------------------------- */

interface CommentItemProps {
  comment: PostComment;
  rootId: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  isReplyOpen: boolean;
  replyValue: string;
  onReplyValueChange: (v: string) => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onLike: () => void;
  onDislike: () => void;
  disabled: boolean;
}

function CommentItem({
  comment,
  isMenuOpen,
  onToggleMenu,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onToggleHidden,
  isReplyOpen,
  replyValue,
  onReplyValueChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onLike,
  onDislike,
  disabled,
}: CommentItemProps) {
  // Vue restreinte : un commentaire masqué, pour un visiteur qui n'est ni auteur ni modérateur
  const isRestrictedView = comment.isHidden && !comment.canEdit && !comment.canModerate;

  return (
    <div className="flex items-start gap-3">
      <Avatar username={comment.author.username} avatar={comment.author.avatar} nom={comment.author.nom} prenom={comment.author.prenom} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold text-foreground">{comment.author.prenom} {comment.author.nom}</span>{" "}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
              {comment.isEdited && " · modifié"}
            </span>
            {comment.isHidden && comment.canModerate && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                <EyeOff className="h-3 w-3" />
                Masqué
              </span>
            )}
          </p>
          <CommentMenu
            comment={comment}
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onEdit={onStartEdit}
            onDelete={onDelete}
            onToggleHidden={onToggleHidden}
          />
        </div>

        {isEditing ? (
          <ComposerBox
            value={editValue}
            onChange={onEditValueChange}
            onSubmit={onSubmitEdit}
            onCancel={onCancelEdit}
            disabled={disabled}
            submitLabel="Enregistrer"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              "mt-1 whitespace-pre-wrap break-words text-sm",
              isRestrictedView ? "italic text-muted-foreground" : "text-foreground/90",
            )}
          >
            {comment.replyToUsername && (
              <span className="mr-1 font-medium text-primary">@{comment.replyToUsername}</span>
            )}
            {comment.content}
          </p>
        )}

        {!isEditing && !isRestrictedView && (
          <ReactionRow comment={comment} onLike={onLike} onDislike={onDislike} onReply={onStartReply} />
        )}

        {isReplyOpen && (
          <ComposerBox
            value={replyValue}
            onChange={onReplyValueChange}
            onSubmit={onSubmitReply}
            onCancel={onCancelReply}
            disabled={disabled}
            submitLabel="Répondre"
            autoFocus
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Section complète ------------------------------- */

export function CommentSection({ postId, threads }: CommentSectionProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [replyTarget, setReplyTarget] = useState<{ rootId: string; commentId: string } | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [reactionOverrides, setReactionOverrides] = useState<
    Record<string, { likeCount: number; dislikeCount: number; userReaction: "LIKE" | "DISLIKE" | null }>
  >({});
  const [contentOverrides, setContentOverrides] = useState<Record<string, { content: string; isEdited: boolean }>>({});
  const [hiddenOverrides, setHiddenOverrides] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Ferme le menu "..." au clic en dehors
  useEffect(() => {
    if (!menuOpenId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-comment-menu]")) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  const applyOverrides = (comment: PostComment): PostComment => {
    const reaction = reactionOverrides[comment.id];
    const contentOverride = contentOverrides[comment.id];
    const hiddenOverride = hiddenOverrides[comment.id];
    return {
      ...comment,
      ...(reaction ?? {}),
      ...(contentOverride
        ? { content: contentOverride.content, isEdited: contentOverride.isEdited }
        : {}),
      ...(hiddenOverride !== undefined ? { isHidden: hiddenOverride } : {}),
    };
  };

  const visibleThreads = useMemo(() => {
    return threads
      .filter((t) => !deletedIds.has(t.root.id))
      .map((t) => ({
        root: applyOverrides(t.root),
        replies: t.replies.filter((r) => !deletedIds.has(r.id)).map(applyOverrides),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, deletedIds, reactionOverrides, contentOverrides, hiddenOverrides]);

  const totalCount = useMemo(
    () => visibleThreads.reduce((sum, t) => sum + 1 + t.replies.length, 0),
    [visibleThreads],
  );

  const toggleExpanded = (rootId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  };

  const closeReplyBox = () => {
    setReplyTarget(null);
    setReplyValue("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const requireAuthOr = (errorCode: string, run: () => void) => {
    if (errorCode === "auth_required") {
      router.push("/login");
      return;
    }
    run();
  };

  const handlePostComment = () => {
    if (!value.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await addComment(postId, value);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Une erreur est survenue, réessayez."));
        return;
      }
      setValue("");
      router.refresh();
    });
  };

  const handlePostReply = () => {
    if (!replyTarget || !replyValue.trim() || isPending) return;
    setError(null);
    const { rootId, commentId } = replyTarget;
    startTransition(async () => {
      const result = await addComment(postId, replyValue, commentId);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Une erreur est survenue, réessayez."));
        return;
      }
      closeReplyBox();
      setExpanded((prev) => new Set(prev).add(rootId));
      router.refresh();
    });
  };

  const handleSubmitEdit = (comment: PostComment) => {
    if (!editValue.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await editComment(comment.id, editValue);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Impossible de modifier ce commentaire."));
        return;
      }
      setContentOverrides((prev) => ({
        ...prev,
        [comment.id]: { content: result.content, isEdited: true },
      }));
      closeEdit();
      router.refresh();
    });
  };

  const handleDelete = (comment: PostComment) => {
    setMenuOpenId(null);
    if (!window.confirm("Supprimer ce commentaire ? Cette action est irréversible.")) return;
    startTransition(async () => {
      const result = await deleteComment(comment.id);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Impossible de supprimer ce commentaire."));
        return;
      }
      setDeletedIds((prev) => new Set(prev).add(comment.id));
      router.refresh();
    });
  };

  const handleToggleHidden = (comment: PostComment) => {
    setMenuOpenId(null);
    startTransition(async () => {
      const result = await setCommentHidden(comment.id, !comment.isHidden);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Action non autorisée."));
        return;
      }
      setHiddenOverrides((prev) => ({ ...prev, [comment.id]: result.isHidden }));
      router.refresh();
    });
  };

  const handleReaction = (comment: PostComment, type: "LIKE" | "DISLIKE") => {
    startTransition(async () => {
      const result = await toggleCommentReaction(comment.id, type);
      if ("error" in result) {
        requireAuthOr(result.error, () => setError("Une erreur est survenue, réessayez."));
        return;
      }
      setReactionOverrides((prev) => ({ ...prev, [comment.id]: result }));
    });
  };

  const renderCommentItem = (comment: PostComment, rootId: string) => (
    <CommentItem
      comment={comment}
      rootId={rootId}
      isMenuOpen={menuOpenId === comment.id}
      onToggleMenu={() => setMenuOpenId((prev) => (prev === comment.id ? null : comment.id))}
      isEditing={editingId === comment.id}
      editValue={editValue}
      onEditValueChange={setEditValue}
      onStartEdit={() => {
        setMenuOpenId(null);
        setEditingId(comment.id);
        setEditValue(comment.content);
      }}
      onCancelEdit={closeEdit}
      onSubmitEdit={() => handleSubmitEdit(comment)}
      onDelete={() => handleDelete(comment)}
      onToggleHidden={() => handleToggleHidden(comment)}
      isReplyOpen={replyTarget?.commentId === comment.id}
      replyValue={replyValue}
      onReplyValueChange={setReplyValue}
      onStartReply={() =>
        replyTarget?.commentId === comment.id
          ? closeReplyBox()
          : setReplyTarget({ rootId, commentId: comment.id })
      }
      onCancelReply={closeReplyBox}
      onSubmitReply={handlePostReply}
      onLike={() => handleReaction(comment, "LIKE")}
      onDislike={() => handleReaction(comment, "DISLIKE")}
      disabled={isPending}
    />
  );

  return (
    <section className="mt-5 border-t border-slate-200 pt-5">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-foreground">
        <MessageCircle className="h-5 w-5 text-primary" />
        Commentaires ({totalCount})
      </h2>

      {/* Nouveau commentaire */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePostComment();
            }}
            placeholder="Ajouter un commentaire..."
            className="w-full border-b border-input bg-transparent pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {value && (
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setValue("")}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handlePostComment}
                disabled={isPending || !value.trim()}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                Commenter
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}

      {visibleThreads.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Aucun commentaire pour le moment. Soyez le premier à réagir !
        </p>
      ) : (
        <ul className="space-y-6">
          {visibleThreads.map((thread) => {
            const isExpanded = expanded.has(thread.root.id);

            return (
              <li key={thread.root.id}>
                {renderCommentItem(thread.root, thread.root.id)}

                {/* Réponses */}
                {thread.replies.length > 0 && (
                  <div className="ml-12 mt-2">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(thread.root.id)}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {isExpanded
                        ? "Masquer les réponses"
                        : `${thread.replies.length} réponse${thread.replies.length > 1 ? "s" : ""}`}
                    </button>

                    {isExpanded && (
                      <ul className="mt-3 space-y-4 border-l border-border pl-4">
                        {thread.replies.map((reply) => (
                          <li key={reply.id}>{renderCommentItem(reply, thread.root.id)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}