"use client";

import { useState } from "react";
import { ModerationKeywordsPanel } from "@/components/admin/moderation-keywords-panel";
import { ModerationLogList } from "@/components/admin/moderation-log-list";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "queue", label: "File d'attente" },
  { id: "keywords", label: "Mots-clés" },
  { id: "log", label: "Journal" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ModerationTabs() {
  const [active, setActive] = useState<TabId>("queue");

  return (
    <div className="space-y-5">
      <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border bg-background p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "min-h-10 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active === tab.id
                ? "bg-primarys2-700 text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {active === "queue" && <ModerationQueue />}
        {active === "keywords" && <ModerationKeywordsPanel />}
        {active === "log" && <ModerationLogList />}
      </div>
    </div>
  );
}
