"use client";

import { Tag } from "lucide-react";
import { useState } from "react";
import { getActuPosts, type HomePostCard } from "@/app/actions/posts";
import { PostTypeExplorer } from "@/components/posts/post-type-explorer";
import { cn } from "@/lib/utils";

interface ActuExplorerProps {
  initialPosts: HomePostCard[];
  initialTotal: number;
  availableTags: string[];
}

export function ActuExplorer(props: Readonly<ActuExplorerProps>) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <PostTypeExplorer
      initialPosts={props.initialPosts}
      initialTotal={props.initialTotal}
      filterKey={activeTag}
      fetchPosts={(params) => getActuPosts({ ...params, tag: activeTag })}
      searchPlaceholder="Rechercher une actualité..."
      renderCount={(total) =>
        total === 0
          ? "Aucune actualité"
          : `${total} actualité${total > 1 ? "s" : ""}`
      }
      renderEmptyMessage={(search) =>
        search
          ? `Aucune actualité ne correspond à "${search}"`
          : activeTag
            ? `Aucune actualité avec le tag ${activeTag}`
            : "Aucune actualité pour l'instant"
      }
      emptyStateAction={
        activeTag
          ? {
              label: "Réinitialiser le filtre",
              onClick: () => setActiveTag(null),
            }
          : undefined
      }
      renderBadge={() => (
        <span className="left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Actu
        </span>
      )}
      filters={
        <>
          {props.availableTags.length > 0 && (
            <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              !activeTag
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground hover:border-primary/40",
            )}
          >
            Tous
          </button>
          {props.availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                activeTag === tag
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/40",
              )}
            >
              {tag}
            </button>
          ))}
        </>
      }
    />
  );
}
