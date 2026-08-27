"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AnnouncementItem } from "@/app/actions/announcements";
import { ANNOUNCEMENT_OPEN_EVENT } from "@/components/announcements/announcement-events";
import { renderPostContent } from "@/lib/render-post-content";

interface AnnouncementPopupProps {
  announcements: AnnouncementItem[];
}

function shouldHidePopup(pathname: string): boolean {
  const hiddenPrefixes = [
    "/signup",
    "/login",
    "/admin-signup",
    "/admin-login",
    "/admin",
    "/actus",
    "/infos",
    "/emplois-du-temps",
    "/devoirs",
    "/posts",
    "/profile",
    "/mentions-legales",
    "/cgu",
    "/confidentialite",
  ];

  return hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function AnnouncementPopup(props: Readonly<AnnouncementPopupProps>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      if (!dialogNode.open) {
        dialogNode.showModal();
      }
    } else if (dialogNode.open) {
      dialogNode.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialogNode) {
        setIsOpen(false);
      }
    };

    dialogNode.addEventListener("click", handleBackdropClick);
    return () => {
      dialogNode.removeEventListener("click", handleBackdropClick);
    };
  }, []);

  useEffect(() => {
    if (props.announcements.length === 0) return;
    if (pathname.startsWith("/admin")) return;
    setIsOpen(true);
  }, [props.announcements.length, pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail;
      if (detail?.id) {
        const foundIndex = props.announcements.findIndex(
          (a) => a.id === detail.id,
        );
        if (foundIndex !== -1) setIndex(foundIndex);
      }
      setIsOpen(true);
    };
    window.addEventListener(ANNOUNCEMENT_OPEN_EVENT, handler);
    return () => window.removeEventListener(ANNOUNCEMENT_OPEN_EVENT, handler);
  }, [props.announcements]);

  // Jamais de pop-up d'annonce par-dessus les pages exclues.
  if (shouldHidePopup(pathname)) return null;
  if (props.announcements.length === 0) return null;

  const current = props.announcements[index];
  const hasMultiple = props.announcements.length > 1;

  const goTo = (i: number) => {
    setIndex(
      ((i % props.announcements.length) + props.announcements.length) %
        props.announcements.length,
    );
  };

  const bodyText = current.content?.trim() ? current.content : current.summary;

  return (
    <dialog
      ref={dialogRef}
      aria-label={current.title}
      onClose={() => setIsOpen(false)}
      className="m-auto h-full w-full max-h-[30rem] max-w-[50rem] rounded-3xl p-0 backdrop:bg-black/50 open:flex open:flex-col"
    >
      <div className="relative flex h-full w-full max-h-[30rem] max-w-[50rem] flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between px-6 pb-2 pt-4 sm:px-8">
          <h2 className="container text-center text-lg font-extrabold uppercase text-slate-900 sm:text-xl">
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

        <div className="flex-1 overflow-y-auto px-6 py-1 sm:px-8 mb-6">
          {renderPostContent(bodyText)}
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
              {props.announcements.map((a, i) => (
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
    </dialog>
  );
}
