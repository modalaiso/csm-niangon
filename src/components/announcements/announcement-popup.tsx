"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { AnnouncementItem } from "@/app/actions/announcements";
import { ANNOUNCEMENT_OPEN_EVENT } from "@/components/announcements/announcement-events";

interface AnnouncementPopupProps {
  announcements: AnnouncementItem[];
}

const SESSION_KEY = "csm-niangon-announcements-seen";

/**
 * Rendu minimal du **gras** et *italique*, ligne par ligne — identique à
 * la logique utilisée sur la page de détail d'un post.
 */
function renderLine(line: string, key: number) {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <p key={key} className="mb-3 text-sm leading-relaxed text-slate-700">
      {parts.map((part, i) => {
        const partKey = `${part}-${i}`;
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partKey} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={partKey} className="italic text-slate-600">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={partKey}>{part}</span>;
      })}
    </p>
  );
}

function renderContent(content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((line, index) => renderLine(line, index));
}

export function AnnouncementPopup({ announcements }: AnnouncementPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Affichage automatique une fois par session, à l'arrivée sur le site
  useEffect(() => {
    if (announcements.length === 0) return;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (!alreadySeen) {
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, [announcements.length]);

  // Réouverture depuis l'InfoBar (clic sur une annonce précise)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail;
      if (detail?.id) {
        const foundIndex = announcements.findIndex((a) => a.id === detail.id);
        if (foundIndex !== -1) setIndex(foundIndex);
      }
      setIsOpen(true);
    };
    window.addEventListener(ANNOUNCEMENT_OPEN_EVENT, handler);
    return () => window.removeEventListener(ANNOUNCEMENT_OPEN_EVENT, handler);
  }, [announcements]);

  if (announcements.length === 0 || !isOpen) return null;

  const current = announcements[index];
  const hasMultiple = announcements.length > 1;

  const goTo = (i: number) => {
    setIndex(((i % announcements.length) + announcements.length) % announcements.length);
  };

  const bodyText = current.content?.trim() ? current.content : current.summary;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative flex h-full max-h-96 w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-2 sm:px-8">
          <h2 className="container text-lg text-center font-extrabold uppercase text-slate-900 sm:text-xl">
            {current.title}
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer"
            className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-1 sm:px-8">
          {renderContent(bodyText)}
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-2 sm:px-8">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Annonce précédente"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {announcements.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Aller à l'annonce ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-primary" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Annonce suivante"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}