"use client";

import type { VisitTrendPoint } from "@/app/actions/analytics";

interface VisitTrendChartProps {
  data: VisitTrendPoint[];
}

const CHART_WIDTH = 740;
const CHART_HEIGHT = 220;
const PADDING = { top: 14, right: 12, bottom: 30, left: 30 };

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", options);
}

export function VisitTrendChart(props: Readonly<VisitTrendChartProps>) {
  const max = Math.max(1, ...props.data.map((point) => point.count));
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const points = props.data.map((point, index) => ({
    ...point,
    x:
      PADDING.left +
      (props.data.length <= 1
        ? plotWidth / 2
        : (index / (props.data.length - 1)) * plotWidth),
    y:
      PADDING.top +
      plotHeight -
      (point.count / max) * Math.max(1, plotHeight - 8),
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points.at(-1)?.x} ${CHART_HEIGHT - PADDING.bottom} L ${points[0].x} ${CHART_HEIGHT - PADDING.bottom} Z`
      : "";
  const total = props.data.reduce((sum, point) => sum + point.count, 0);

  if (!total) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-lg font-bold">0</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Aucune vue qualifiée sur cette période.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {total.toLocaleString("fr-FR")}
        </span>
        <span className="text-xs text-muted-foreground">
          vues qualifiées sur 30 jours
        </span>
      </div>
      <svg
        aria-label="Évolution quotidienne des vues qualifiées sur 30 jours"
        className="h-56 w-full overflow-visible text-primary"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="qualified-view-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => {
          const y = PADDING.top + (plotHeight / 3) * step;
          return (
            <line
              key={step}
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="4 5"
            />
          );
        })}
        <path d={areaPath} fill="url(#qualified-view-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          className="text-primary"
        />
        {points.map((point, index) => {
          const isLabelled =
            index === 0 ||
            index === points.length - 1 ||
            index % Math.max(1, Math.ceil(points.length / 6)) === 0;
          return (
            <g key={point.date}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="fill-background stroke-primary"
                strokeWidth="2"
              >
                <title>
                  {formatDate(point.date, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  : {point.count.toLocaleString("fr-FR")} vues qualifiées
                </title>
              </circle>
              {isLabelled && (
                <text
                  x={point.x}
                  y={CHART_HEIGHT - 5}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="10"
                >
                  {formatDate(point.date, { day: "2-digit", month: "2-digit" })}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
