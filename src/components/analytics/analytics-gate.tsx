"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { WebVitals } from "@/components/analytics/web-vitals";
import { CONSENT_CHANGE_EVENT, getStoredConsent } from "@/lib/cookie-consent";

/**
 * Ne monte le suivi d'audience (VisitLog interne + Vercel Analytics) que si
 * l'utilisateur a explicitement accepté les cookies de mesure d'audience.
 * Le compteur de vues par post (PostView) n'est pas concerné : il n'utilise
 * aucun cookie et valide une lecture après 10 secondes d'activité, comme
 * indiqué dans la politique de confidentialité.
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
      <WebVitals />
      <Analytics />
    </>
  );
}
