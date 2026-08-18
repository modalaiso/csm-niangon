"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostTypeExplorer } from "@/components/posts/post-type-explorer";
import { getInfoPosts, type InfoPostCard, type InfoUrgencyFilter } from "@/app/actions/posts";

interface InfoExplorerProps {
  initialPosts: InfoPostCard[];
  initialTotal: number;
}

const URGENCY_FILTERS: { label: string; value: InfoUrgencyFilter }[] = [
  { label: "Toutes", value: "ALL" },
  { label: "Normales", value: "NORMAL" },
  { label: "Urgentes", value: "URGENT" },
];

export function InfoExplorer(props: Readonly<InfoExplorerProps>) {
  const [urgency, setUrgency] = useState<InfoUrgencyFilter>("ALL");

  const getUrgencyButtonClass = (item: { value: InfoUrgencyFilter }) => {
    if (urgency !== item.value) {
      return "border-border bg-white text-foreground hover:border-primary/40";
    }
    if (item.value === "URGENT") {
      return "border-secondary bg-secondary text-secondary-foreground";
    }
    return "border-primary bg-primary text-white";
  };

  return (
    <PostTypeExplorer
      initialPosts={props.initialPosts}
      initialTotal={props.initialTotal}
      filterKey={urgency}
      fetchPosts={(params) => getInfoPosts({ ...params, urgency })}
      searchPlaceholder="Rechercher une information..."
      renderCount={(total) =>
        total === 0 ? "Aucune information" : `${total} information${total > 1 ? "s" : ""}`
      }
      renderEmptyMessage={(search) =>
        search
          ? `Aucune information ne correspond à "${search}"`
          : "Aucune information pour l'instant"
      }
      renderBadge={(post) => (
        <span
          className={cn(
            "left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white",
            post.isUrgent ? "bg-secondary text-secondary-foreground" : "bg-amber-500",
          )}
        >
          {post.isUrgent && <AlertTriangle className="h-3 w-3" />}
          {post.isUrgent ? "Urgent" : "Info"}
        </span>
      )}
      filters={URGENCY_FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setUrgency(item.value)}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            getUrgencyButtonClass(item),
          )}
        >
          {item.value === "URGENT" && <AlertTriangle className="h-3.5 w-3.5" />}
          {item.label}
        </button>
      ))}
    />
  );
}