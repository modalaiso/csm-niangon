"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { HomePostCard } from "@/app/actions/posts";
import type { ViewMode } from "@/components/ui/view-mode-toggle";

interface PostResultsProps<T extends HomePostCard> {
  posts: T[];
  viewMode: ViewMode;
  emptyStateMessage: string;
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
  renderBadge: (post: T, viewMode: ViewMode) => ReactNode;
}

interface PostCardProps<T extends HomePostCard> {
  post: T;
  viewMode: ViewMode;
  renderBadge: (post: T, viewMode: ViewMode) => ReactNode;
}

function PostCard<T extends HomePostCard>(props: Readonly<PostCardProps<T>>) {
  const badge = props.renderBadge(props.post, props.viewMode);

  if (props.viewMode === "grid") {
    return (
      <Link
        key={props.post.id}
        href={`/posts/${props.post.id}`}
        className="group overflow-hidden rounded-2xl border border-border transition-all hover:border-primary/40 bg-white"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {props.post.thumbnail ? (
            <img
              src={props.post.thumbnail}
              alt={props.post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Pas d&apos;image
            </div>
          )}
          {badge}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-bold text-foreground">{props.post.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{props.post.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              Créé par{" "}
              <span className="font-medium text-foreground">
                {props.post.author.prenom} {props.post.author.nom}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {props.post.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeTime(props.post.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <li key={props.post.id}>
      <Link
        href={`/posts/${props.post.id}`}
        className="flex items-start gap-4 p-4 transition-colors hover:bg-accent/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {badge}
            <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
              {props.post.title}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {props.post.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
            <span>
              Créé par{" "}
              <span className="font-medium text-foreground">
                {props.post.author.prenom} {props.post.author.nom}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {props.post.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(props.post.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function PostResults<T extends HomePostCard>(props: Readonly<PostResultsProps<T>>) {
  if (props.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <p className="text-base font-medium text-muted-foreground">{props.emptyStateMessage}</p>
        {props.emptyStateAction && (
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={props.emptyStateAction.onClick}
          >
            {props.emptyStateAction.label}
          </Button>
        )}
      </div>
    );
  }

  if (props.viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {props.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewMode={props.viewMode}
            renderBadge={props.renderBadge}
          />
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
      {props.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          viewMode={props.viewMode}
          renderBadge={props.renderBadge}
        />
      ))}
    </ul>
  );
}
