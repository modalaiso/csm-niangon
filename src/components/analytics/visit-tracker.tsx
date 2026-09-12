"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logVisit } from "@/app/actions/analytics";
import {
  captureCampaignParameters,
  getAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";

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

/**
 * Composant invisible monté globalement (layout racine) qui enregistre
 * une visite à chaque changement de route sur les pages publiques.
 * Les pages admin/auth ne sont pas comptabilisées dans les stats de trafic.
 */
export function VisitTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);
  const pageStartedAt = useRef(0);
  const maxScrollDepth = useRef(0);
  const trackedScrollDepths = useRef(new Set<number>());

  useEffect(() => {
    if (!pathname) return;

    const isExcluded = EXCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    if (isExcluded || lastLoggedPath.current === pathname) return;
    lastLoggedPath.current = pathname;

    const sessionId = getAnalyticsSessionId();
    captureCampaignParameters();
    pageStartedAt.current = Date.now();
    maxScrollDepth.current = 0;
    trackedScrollDepths.current = new Set();

    logVisit({
      path: pathname,
      sessionId,
      referrer: document.referrer || null,
      device: detectDevice(),
    }).catch((error) => {
      console.error("Erreur lors du suivi de la visite:", error);
    });

    trackAnalyticsEvent("page_view", {
      title: document.title,
      referrer: document.referrer || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      device: detectDevice(),
    });

    const reportEngagement = () => {
      const now = Date.now();
      const durationMs = now - pageStartedAt.current;
      if (durationMs < 1000) return;
      pageStartedAt.current = now;
      trackAnalyticsEvent(
        "page_engagement",
        {
          durationMs,
          maxScrollDepth: maxScrollDepth.current,
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
      maxScrollDepth.current = Math.max(maxScrollDepth.current, depth);

      for (const threshold of [25, 50, 75, 90, 100]) {
        if (depth >= threshold && !trackedScrollDepths.current.has(threshold)) {
          trackedScrollDepths.current.add(threshold);
          trackAnalyticsEvent("scroll_depth", { depth: threshold });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") reportEngagement();
    };

    const handleExternalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");
      if (!link?.href || new URL(link.href).origin === window.location.origin)
        return;
      trackAnalyticsEvent("outbound_click", {
        host: new URL(link.href).host,
      });
    };

    window.addEventListener("scroll", reportScrollDepth, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleExternalClick);

    return () => {
      reportEngagement();
      window.removeEventListener("scroll", reportScrollDepth);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleExternalClick);
    };
  }, [pathname]);

  return null;
}
