"use client";

export type ConsentStatus = "accepted" | "rejected";

const STORAGE_KEY = "csm_cookie_consent";
export const CONSENT_CHANGE_EVENT = "csm:cookie-consent-change";
export const COOKIE_PREFERENCES_OPEN_EVENT = "csm:open-cookie-preferences";

export function getStoredConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setStoredConsent(status: ConsentStatus) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, status);
  } catch {
    // localStorage indisponible : le bandeau réapparaîtra à chaque visite, sans bloquer le reste
  }
  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { status } }),
  );
}

/** Rouvre le bandeau de préférences cookies depuis n'importe où (ex: pied de page) */
export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT));
}
