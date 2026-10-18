"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { logVisit } from "@/app/actions/analytics";
import {
  captureCampaignParameters,
  getAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";
import { MIN_POST_VIEW_SECONDS } from "@/lib/post-view-tracking";

function detectDevice(): string {
  if (typeof window === "undefined") return "unknown";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

const EXCLUDED_PREFIXES = [
  "/admin",
  "/login",
  "/signup",
  "/admin-login",
  "/admin-signup",
];
const ENGAGEMENT_REPORT_INTERVAL_SECONDS = 30;

/**
 * Enregistre les pages publiques après 10 secondes de lecture active.
 * Les périodes où l'onglet est masqué ne sont pas comptées.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const isExcluded = EXCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    if (isExcluded) return;

    const sessionId = getAnalyticsSessionId();
    captureCampaignParameters();
    let activeMilliseconds = 0;
    let activeSince =
      document.visibilityState === "visible" ? Date.now() : null;
    let lastReportedMilliseconds = 0;
    let isQualified = false;
    let maxScrollDepth = 0;
    const trackedScrollDepths = new Set<number>();

    const getActiveMilliseconds = () =>
      activeMilliseconds +
      (activeSince === null ? 0 : Math.max(0, Date.now() - activeSince));

    const trackScrollThresholds = () => {
      for (const threshold of [25, 50, 75, 90, 100]) {
        if (
          maxScrollDepth >= threshold &&
          !trackedScrollDepths.has(threshold)
        ) {
          trackedScrollDepths.add(threshold);
          trackAnalyticsEvent("scroll_depth", { depth: threshold });
        }
      }
    };

    const qualifyVisit = () => {
      if (isQualified || getActiveMilliseconds() < MIN_POST_VIEW_SECONDS * 1000)
        return;

      isQualified = true;
      void logVisit({
        path: pathname,
        sessionId,
        referrer: document.referrer || null,
        device: detectDevice(),
      }).catch((error: unknown) => {
        console.error("Erreur lors du suivi de la visite:", error);
      });

      trackAnalyticsEvent("page_view", {
        title: document.title,
        referrer: document.referrer || null,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        device: detectDevice(),
      });
      trackScrollThresholds();
    };

    const reportEngagement = (force = false) => {
      const currentMilliseconds = getActiveMilliseconds();
      qualifyVisit();
      if (!isQualified) return;

      const durationMs = Math.floor(
        currentMilliseconds - lastReportedMilliseconds,
      );
      if (
        durationMs < 1000 ||
        (!force &&
          currentMilliseconds - lastReportedMilliseconds <
            ENGAGEMENT_REPORT_INTERVAL_SECONDS * 1000)
      ) {
        return;
      }

      lastReportedMilliseconds = currentMilliseconds;
      trackAnalyticsEvent(
        "page_engagement",
        {
          durationMs,
          maxScrollDepth,
          visibility: document.visibilityState,
        },
        { keepalive: true },
      );
    };

    const reportScrollDepth = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = Math.max(1, documentHeight - viewportHeight);
      const depth = Math.min(
        100,
        Math.round((window.scrollY / scrollableHeight) * 100),
      );
      maxScrollDepth = Math.max(maxScrollDepth, depth);
      qualifyVisit();
      if (isQualified) trackScrollThresholds();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (activeSince !== null) {
          activeMilliseconds += Date.now() - activeSince;
          activeSince = null;
        }
        reportEngagement(true);
      } else {
        activeSince = Date.now();
      }
    };

    const handleExternalClick = (event: MouseEvent) => {
      if (!isQualified) return;
      const target = event.target as HTMLElement;
      const link = target.closest("a");
      if (!link?.href || new URL(link.href).origin === window.location.origin)
        return;
      trackAnalyticsEvent("outbound_click", {
        host: new URL(link.href).host,
      });
    };

    const intervalId = window.setInterval(() => reportEngagement(), 1000);
    window.addEventListener("scroll", reportScrollDepth, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleExternalClick);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("scroll", reportScrollDepth);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleExternalClick);
      if (activeSince !== null) {
        activeMilliseconds += Date.now() - activeSince;
        activeSince = null;
      }
      reportEngagement(true);
    };
  }, [pathname]);

  return null;
}
