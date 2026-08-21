"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStoredConsent,
  setStoredConsent,
  COOKIE_PREFERENCES_OPEN_EVENT,
  type ConsentStatus,
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);

    const handleReopen = () => setVisible(true);
    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, handleReopen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, handleReopen);
  }, []);

  const handleChoice = (status: ConsentStatus) => {
    setStoredConsent(status);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Préférences de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:p-0"
    >
      <div className="rounded-3xl border border-border bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-primary">
            <Cookie className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ce site utilise des cookies
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Nous utilisons des cookies techniques nécessaires au fonctionnement du site,
              et, avec votre accord, des cookies de mesure d&apos;audience pour comprendre
              l&apos;usage du site. Voir notre{" "}
              <Link href="/confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleChoice("rejected")}
            className="rounded-full"
          >
            Refuser
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleChoice("accepted")}
            className="rounded-full text-white"
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}