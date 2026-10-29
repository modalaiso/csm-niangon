"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import {
  MAX_POST_VIEW_SECONDS,
  MIN_POST_VIEW_SECONDS,
} from "@/lib/post-view-tracking";

interface PostViewTrackerProps {
  postId: string;
  initialViews: number;
}

const DURATION_UPDATE_INTERVAL_SECONDS = 60;

export function PostViewTracker({
  postId,
  initialViews,
}: Readonly<PostViewTrackerProps>) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let activeMilliseconds = 0;
    let activeSince =
      document.visibilityState === "visible" ? Date.now() : null;
    let lastReportedSeconds = 0;

    const getActiveSeconds = () => {
      const elapsed =
        activeSince === null ? 0 : Math.max(0, Date.now() - activeSince);
      return Math.min(
        MAX_POST_VIEW_SECONDS,
        Math.floor((activeMilliseconds + elapsed) / 1000),
      );
    };

    const reportDuration = (force = false, useBeacon = false) => {
      const durationSeconds = getActiveSeconds();
      if (durationSeconds < MIN_POST_VIEW_SECONDS) return;
      if (
        durationSeconds <= lastReportedSeconds ||
        (!force &&
          lastReportedSeconds > 0 &&
          durationSeconds - lastReportedSeconds <
            DURATION_UPDATE_INTERVAL_SECONDS)
      ) {
        return;
      }

      lastReportedSeconds = durationSeconds;
      const payload = JSON.stringify({ durationSeconds });
      const url = `/api/posts/${encodeURIComponent(postId)}/view`;

      if (
        useBeacon &&
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(
          url,
          new Blob([payload], { type: "application/json" }),
        )
      ) {
        return;
      }

      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Le serveur a répondu ${response.status}.`);
          }
          return response.json() as Promise<{ qualified?: boolean }>;
        })
        .then((result) => {
          if (result.qualified) {
            setViews((count) => count + 1);
          }
        })
        .catch((error: unknown) => {
          console.error("Erreur lors du suivi du temps de lecture:", error);
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (activeSince !== null) {
          activeMilliseconds += Date.now() - activeSince;
          activeSince = null;
        }
        reportDuration(true);
      } else {
        activeSince = Date.now();
      }
    };

    const handlePageHide = () => reportDuration(true, true);
    const intervalId = window.setInterval(() => reportDuration(), 1000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      if (activeSince !== null) {
        activeMilliseconds += Date.now() - activeSince;
        activeSince = null;
      }
      reportDuration(true, true);
    };
  }, [postId]);

  return (
    <span
      className="inline-flex items-center gap-1"
      title="Lecture comptée après au moins 10 secondes d’activité"
    >
      <Eye aria-hidden="true" className="h-3.5 w-3.5" />
      {views}
    </span>
  );
}
