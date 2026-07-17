"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostGalleryProps {
  images: string[];
  alt: string;
}

export function PostGallery({ images, alt }: PostGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: "smooth" });
  };

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    setActive(clamped);
    scrollToIndex(clamped);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    if (clamped !== active) setActive(clamped);
  };

  // Une seule image : pas besoin de scroll, juste une belle illustration
  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-3xl bg-muted">
        <img
          src={images[0]}
          alt={alt}
          className="max-h-[480px] w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Chaque image occupe toute la largeur : une seule visible à la fois,
          le scroll (ou les flèches) fait défiler vers la suivante */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`${alt} — image ${i + 1}`}
            className="h-[280px] w-full flex-shrink-0 snap-center rounded-3xl bg-muted object-cover sm:h-[380px] md:h-[440px]"
          />
        ))}
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
        disabled={active === images.length - 1}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-white/80 p-2 shadow-lg backdrop-blur transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0 group-hover:sm:flex"
      >
        <ChevronRight className="h-5 w-5 text-primary" />
      </button>

      {/* Pagination par points */}
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
      </div>
    </div>
  );
}