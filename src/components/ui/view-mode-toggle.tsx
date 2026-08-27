"use client";

import { LayoutGrid, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle(props: Readonly<ViewModeToggleProps>) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-border bg-white p-1">
      <button
        type="button"
        onClick={() => props.onChange("grid")}
        aria-label="Affichage en grille"
        aria-pressed={props.value === "grid"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          props.value === "grid"
            ? "bg-primary text-white"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => props.onChange("list")}
        aria-label="Affichage en liste"
        aria-pressed={props.value === "list"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          props.value === "list"
            ? "bg-primary text-white"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ListIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
