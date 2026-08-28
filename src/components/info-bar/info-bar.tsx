"use client";

import { AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { InfoBarItem } from "@/app/actions/infobar";

interface InfoBarProps {
  items: InfoBarItem[];
}

// Vitesse constante de défilement, en pixels par seconde.
// Indépendante du nombre d'items : un contenu plus long ne va ni plus vite ni plus lentement.
const PX_PER_SECOND = 45;

export function InfoBar(props: Readonly<InfoBarProps>) {
  const pathname = usePathname();

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const hasUrgent = props.items.some((item) => item.isUrgent);
  // Le contenu est dupliqué pour permettre une boucle continue sans saut visible
  const track = [...props.items, ...props.items];

  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl || props.items.length === 0) return;

    // Mesure la largeur d'un seul jeu d'items (la moitié du contenu dupliqué),
    // recalculée à chaque changement de taille (police, largeur d'écran, etc.)
    const measure = () => {
      singleSetWidthRef.current = trackEl.scrollWidth / 2;
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(trackEl);

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (!isPausedRef.current && singleSetWidthRef.current > 0) {
        offsetRef.current += PX_PER_SECOND * deltaSeconds;
        // Boucle transparente : une fois qu'on a défilé la largeur d'un jeu complet,
        // on revient à 0 sans que ce soit perceptible (le second jeu est identique)
        if (offsetRef.current >= singleSetWidthRef.current) {
          offsetRef.current -= singleSetWidthRef.current;
        }
        trackEl.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.items.length]);

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  if (!props.items || props.items.length === 0) return null;

  return (
    <section
      aria-label="Informations importantes"
      className={`w-full overflow-hidden border-b ${
        hasUrgent
          ? "bg-secondary text-secondary-foreground border-secondary/60"
          : "bg-primary/10 text-primary border-primary/20"
      }`}
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
    >
      <div className="flex py-2">
        <div
          ref={trackRef}
          className="flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {track.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={`/posts/${item.id}`}
              className="flex items-center gap-2 px-6 text-sm font-medium hover:underline"
            >
              {item.isUrgent ? (
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 flex-shrink-0" />
              )}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
