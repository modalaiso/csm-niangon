"use client";

import type { VisitTrendPoint } from "@/app/actions/analytics";

interface VisitTrendChartProps {
  data: VisitTrendPoint[];
}

const CHART_HEIGHT_PX = 160; // équivalent à h-40
const MIN_BAR_HEIGHT_PX = 3;

export function VisitTrendChart(props: Readonly<VisitTrendChartProps>) {
  const max = Math.max(1, ...props.data.map((d) => d.count));

  if (props.data.every((d) => d.count === 0)) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Pas encore de visites enregistrées sur cette période.
      </p>
    );
  }

  return (
    <div
      className="flex items-end gap-1"
      style={{ height: `${CHART_HEIGHT_PX}px` }}
    >
      {props.data.map((point) => {
        const barHeight = Math.max(
          MIN_BAR_HEIGHT_PX,
          Math.round((point.count / max) * CHART_HEIGHT_PX),
        );
        const dateLabel = new Date(point.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        });
        return (
          <div
            key={point.date}
            className="group relative flex h-full flex-1 flex-col items-center justify-end"
          >
            <span className="pointer-events-none absolute -top-6 hidden rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white group-hover:block">
              {point.count}
            </span>
            <div
              className="w-full rounded-t-md bg-primary/80 transition-colors group-hover:bg-primary"
              style={{ height: `${barHeight}px` }}
            />
            <span className="mt-1 text-[9px] text-muted-foreground">
              {dateLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
