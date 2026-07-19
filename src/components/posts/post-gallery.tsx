"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PostGalleryProps {
  images: string[];
  alt: string;
}

export function PostGallery(props: PostGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: "smooth" });
  };

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(props.images.length - 1, index));
    setActive(clamped);
    scrollToIndex(clamped);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    const clamped = Math.max(0, Math.min(props.images.length - 1, index));
    if (clamped !== active) setActive(clamped);
  };

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  // Une seule image : pas besoin de scroll, juste une belle illustration
  if (props.images.length === 1) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-muted">
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          1/{props.images.length}
        </span>
        <img
          src={props.images[0]}
          alt={props.alt}
          onClick={openFullscreen}
          className="max-h-[480px] w-full cursor-pointer object-cover"
        />
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Chaque image occupe toute la largeur : une seule visible à la fois,
          le scroll (ou les flèches) fait défiler vers la suivante */}
      <div className="relative">
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {active + 1}/{props.images.length}
        </span>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x rounded-3xl snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {props.images.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${props.alt} — image ${i + 1}`}
              onClick={openFullscreen}
              className="h-[280px] w-full flex-shrink-0 snap-center bg-muted object-cover cursor-pointer sm:h-[380px] md:h-[440px]"
            />
          ))}
        </div>
      </div>

      {/* Flèches de navigation, visibles au survol sur desktop */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        aria-label="Image précédente"
        disabled={active === 0}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-white/80 p-2 shadow-lg backdrop-blur transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0 group-hover:sm:flex"
      >
        <ChevronLeft className="h-5 w-5 text-primary" />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        aria-label="Image suivante"
        disabled={active === props.images.length - 1}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-white/80 p-2 shadow-lg backdrop-blur transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0 group-hover:sm:flex"
      >
        <ChevronRight className="h-5 w-5 text-primary" />
      </button>

      {/* Pagination par points 
      <div className="mt-3 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === active ? "w-6 bg-primary" : "w-2 bg-gray-300",
            )}
          />
        ))}
      </div>*/}

      {isFullscreen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={closeFullscreen}
            aria-label="Fermer le mode plein écran"
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-black shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Image précédente"
            disabled={active === 0}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 p-3 text-white shadow-lg transition-opacity hover:bg-white/30 disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Image suivante"
            disabled={active === props.images.length - 1}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 p-3 text-white shadow-lg transition-opacity hover:bg-white/30 disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <img
            src={props.images[active]}
            alt={`${props.alt} — image ${active + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}