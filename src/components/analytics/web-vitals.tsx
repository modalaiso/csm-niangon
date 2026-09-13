"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

export function WebVitals() {
  useReportWebVitals((metric) => {
    trackAnalyticsEvent("web_vital", {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  });

  return null;
}
