"use client";

import type { VisitTrendPoint } from "@/app/actions/analytics";

interface VisitTrendChartProps {
  data: VisitTrendPoint[];
}

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
    <div className="flex h-40 items-end gap-1">
      {props.data.map((point) => {
        const heightPct = (point.count / max) * 100;
        const dateLabel = new Date(point.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        });
        return (
          <div
            key={point.date}
            className="group relative flex flex-1 flex-col items-center justify-end"
          >
            <span className="pointer-events-none absolute -top-6 hidden rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white group-hover:block">
              {point.count}
            </span>
            <div
              className="w-full rounded-t-md bg-primary/80 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(heightPct, 2)}%` }}
            />
            <span className="mt-1 text-[9px] text-muted-foreground">{dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
}