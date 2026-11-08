"use client";

import { AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { InfoBarItem } from "@/app/actions/infobar";

interface InfoBarProps {
  items: InfoBarItem[];
}

// Vitesse constante de défilement, en pixels par seconde.
// Indépendante du nombre d'items : un contenu plus long ne va ni plus vite ni plus lentement.
const PX_PER_SECOND = 45;

export function InfoBar(props: Readonly<InfoBarProps>) {
  const pathname = usePathname();

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [copies, setCopies] = useState(2);

  const hasUrgent = props.items.some((item) => item.isUrgent);
  const isHiddenRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (isHiddenRoute || props.items.length === 0) return;

    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    const firstSetEl = firstSetRef.current;
    if (!viewportEl || !trackEl || !firstSetEl) return;

    const getCopies = () => {
      if (prefersReducedMotionRef.current) return 1;
      const setWidth = firstSetEl.getBoundingClientRect().width;
      return setWidth > 0
        ? Math.max(2, Math.ceil(viewportEl.clientWidth / setWidth) + 1)
        : 2;
    };

    const measure = () => {
      singleSetWidthRef.current = firstSetEl.getBoundingClientRect().width;
      const nextCopies = getCopies();
      setCopies((currentCopies) =>
        currentCopies === nextCopies ? currentCopies : nextCopies,
      );
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewportEl);
    resizeObserver.observe(firstSetEl);

    const step = (timestamp: number) => {
      if (prefersReducedMotionRef.current) return;

      lastTimeRef.current ??= timestamp;
      const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (
        !isHoveredRef.current &&
        !isFocusedRef.current &&
        singleSetWidthRef.current > 0
      ) {
        offsetRef.current =
          (offsetRef.current + PX_PER_SECOND * deltaSeconds) %
          singleSetWidthRef.current;
        trackEl.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    const startAnimation = () => {
      if (frameRef.current === null) {
        lastTimeRef.current = null;
        frameRef.current = requestAnimationFrame(step);
      }
    };

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches;
      offsetRef.current = 0;
      lastTimeRef.current = null;
      trackEl.style.transform = event.matches ? "none" : "translateX(0px)";

      if (event.matches) {
        setCopies(1);
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      } else {
        measure();
        startAnimation();
      }
    };
    prefersReducedMotionRef.current = motionPreference.matches;
    measure();
    motionPreference.addEventListener("change", handleMotionPreferenceChange);

    if (motionPreference.matches) {
      trackEl.style.transform = "none";
      setCopies(1);
    } else {
      startAnimation();
    }

    return () => {
      resizeObserver.disconnect();
      motionPreference.removeEventListener(
        "change",
        handleMotionPreferenceChange,
      );
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, [isHiddenRoute, props.items]);

  if (isHiddenRoute) return null;
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
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      onFocusCapture={() => {
        isFocusedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          isFocusedRef.current = false;
        }
      }}
    >
      <div
        ref={viewportRef}
        className="flex overflow-hidden py-2 motion-reduce:overflow-x-auto"
      >
        <div
          ref={trackRef}
          className="flex w-max items-center whitespace-nowrap will-change-transform motion-reduce:will-change-auto"
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 0 ? firstSetRef : undefined}
              aria-hidden={copyIndex > 0}
              className="flex shrink-0 items-center"
            >
              {props.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/posts/${item.id}`}
                  tabIndex={copyIndex > 0 ? -1 : undefined}
                  className="flex items-center gap-2 px-6 text-sm font-medium hover:underline"
                >
                  {item.isUrgent ? (
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 shrink-0" />
                  )}
                  {item.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
