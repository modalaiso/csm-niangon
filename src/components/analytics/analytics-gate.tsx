"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { getStoredConsent, CONSENT_CHANGE_EVENT } from "@/lib/cookie-consent";

/**
 * Ne monte le suivi d'audience (VisitLog interne + Vercel Analytics) que si
 * l'utilisateur a explicitement accepté les cookies de mesure d'audience.
 * Le compteur de vues par post (PostView) n'est pas concerné : il n'utilise
 * aucun cookie et reste une fonctionnalité d'affichage du site (nombre de
 * vues visible sur chaque publication), documentée dans la politique de
 * confidentialité.
 */
export function AnalyticsGate() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(getStoredConsent() === "accepted");

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ status: string | null }>).detail;
      setConsented(detail?.status === "accepted");
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
  }, []);

  if (!consented) return null;

  return (
    <>
      <VisitTracker />
      <Analytics />
    </>
  );
}