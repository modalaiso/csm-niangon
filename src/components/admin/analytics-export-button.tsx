"use client";

import { Download } from "lucide-react";
import type { DashboardSummary } from "@/app/actions/admin-dashboard";
import type { AnalyticsSummary, VisitStats } from "@/app/actions/analytics";

interface AnalyticsExportButtonProps {
  visits: VisitStats[];
  analytics: AnalyticsSummary;
  dashboard: DashboardSummary;
}

function escapeCsv(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function AnalyticsExportButton({
  visits,
  analytics,
  dashboard,
}: Readonly<AnalyticsExportButtonProps>) {
  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ["Indicateur", "Période", "Valeur"],
      ...visits.map((visit) => ["Vues qualifiées", visit.label, visit.count]),
      ...visits.map((visit) => [
        "Visiteurs uniques",
        visit.label,
        visit.uniqueSessions,
      ]),
      [
        "Lectures qualifiées",
        "30 derniers jours",
        dashboard.qualifiedViews30Days,
      ],
      [
        "Durée moyenne de lecture",
        "30 derniers jours",
        dashboard.averagePostReadSeconds,
      ],
      [
        "Sessions engagées (30 s+)",
        "30 derniers jours",
        analytics.engagedSessions,
      ],
      ["Taux d'engagement (%)", "30 derniers jours", analytics.engagementRate],
      [
        "Durée active moyenne (s)",
        "30 derniers jours",
        analytics.averageEngagementSeconds,
      ],
      ["Lectures à 90 %", "30 derniers jours", analytics.scrollDepth90],
      ["Recherches", "30 derniers jours", analytics.searches],
      ["Partages", "30 derniers jours", analytics.shares],
      ...dashboard.topPosts.flatMap((post) => [
        ["Publication populaire", post.title, post.views],
        ["Temps moyen de lecture (s)", post.title, post.averageReadSeconds],
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(";")).join("\n")}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `csm-niangon-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <button
      type="button"
      onClick={exportCsv}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Download className="h-4 w-4" />
      Exporter les analyses
    </button>
  );
}
