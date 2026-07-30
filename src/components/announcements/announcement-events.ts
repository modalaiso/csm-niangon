"use client";

export const ANNOUNCEMENT_OPEN_EVENT = "csm:open-announcement";

/**
 * Déclenche l'ouverture du pop-up d'annonces depuis n'importe quel composant
 * client (ex: InfoBar). Si un id est fourni, le pop-up se positionne dessus.
 */
export function openAnnouncementPopup(id?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ANNOUNCEMENT_OPEN_EVENT, { detail: { id } }));
}