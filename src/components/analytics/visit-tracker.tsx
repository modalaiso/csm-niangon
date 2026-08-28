"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logVisit } from "@/app/actions/analytics";

const SESSION_STORAGE_KEY = "csm_visit_sid";

function getOrCreateSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) : id éphémère
    return crypto.randomUUID();
  }
}

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

  useEffect(() => {
    if (!pathname) return;

    const isExcluded = EXCLUDED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    if (isExcluded || lastLoggedPath.current === pathname) return;
    lastLoggedPath.current = pathname;

    const sessionId = getOrCreateSessionId();

    logVisit({
      path: pathname,
      sessionId,
      referrer: document.referrer || null,
      device: detectDevice(),
    }).catch((error) => {
      console.error("Erreur lors du suivi de la visite:", error);
    });
  }, [pathname]);

  return null;
}
