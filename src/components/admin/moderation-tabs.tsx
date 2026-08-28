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
    <div>
      <div className="mb-5 flex items-center gap-1 rounded-full bg-muted p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "queue" && <ModerationQueue />}
      {active === "keywords" && <ModerationKeywordsPanel />}
      {active === "log" && <ModerationLogList />}
    </div>
  );
}
