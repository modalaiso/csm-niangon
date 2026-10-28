"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HomePostCard } from "@/app/actions/posts";

interface HeroCarouselProps {
  posts: HomePostCard[];
}

// Distance minimale (en px) pour considérer le geste comme un swipe volontaire
const SWIPE_THRESHOLD = 40;

function isImageDark(image: HTMLImageElement): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext("2d");
  if (!context) {
    console.warn(
      "Impossible d'analyser la luminosité de l'image du carrousel.",
    );
    return false;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let luminance = 0;
  let pixels = 0;

  for (let y = 9; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const offset = (y * canvas.width + x) * 4;
      const alpha = data[offset + 3] / 255;
      const red = data[offset] * alpha + 255 * (1 - alpha);
      const green = data[offset + 1] * alpha + 255 * (1 - alpha);
      const blue = data[offset + 2] * alpha + 255 * (1 - alpha);

      luminance += (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      pixels++;
    }
  }

  return luminance / pixels < 0.45;
}

export function HeroCarousel(props: Readonly<HeroCarouselProps>) {
  const [index, setIndex] = useState(0);
  const [isDarkImage, setIsDarkImage] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const current = props.posts[index];
  const currentThumbnail = current?.thumbnail;

  useEffect(() => {
    if (props.posts.length === 0) return;

    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    setIsDarkImage(false);
    image.onload = () => {
      if (!active) return;

      try {
        setIsDarkImage(isImageDark(image));
      } catch (error) {
        console.warn(
          "Impossible d'analyser la luminosité de l'image du carrousel.",
          error,
        );
      }
    };
    image.onerror = (error) => {
      console.warn(
        "Impossible de charger l'image pour analyser sa luminosité.",
        error,
      );
    };
    image.src = currentThumbnail ?? "/miniature.png";

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [currentThumbnail, props.posts.length]);

  useEffect(() => {
    if (props.posts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % props.posts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [props.posts.length]);

  // Aucune publication : pas de post inventé, message d'accueil sobre
  if (props.posts.length === 0) {
    return (
      <section className="relative flex h-[280px] w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-4 text-center md:h-[380px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            CSM Niangon
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Aucune information pour l'instant.
          </p>
        </div>
      </section>
    );
  }

  const goTo = (i: number) =>
    setIndex(
      ((i % props.posts.length) + props.posts.length) % props.posts.length,
    );

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (props.posts.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = touchDeltaX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // On ignore les gestes trop verticaux (scroll de page) pour ne réagir
    // qu'aux swipes réellement horizontaux
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) {
        goTo(index + 1);
      } else {
        goTo(index - 1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section
      className="relative h-[420px] w-full touch-pan-y overflow-hidden sm:h-[480px] md:h-[560px]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {props.posts.map((post, i) => (
        <img
          key={post.id}
          src={post.thumbnail ?? "/miniature.png"}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div
        className={`absolute inset-0 hidden bg-gradient-to-r sm:flex ${
          isDarkImage
            ? "from-black/65 via-black/10 to-transparent"
            : "from-white/75 via-white/10 to-transparent"
        }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          isDarkImage
            ? "from-black/75 via-black/20 to-transparent"
            : "from-white/80 via-white/20 to-transparent"
        }`}
      />

      {props.posts.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Publication précédente"
            className="absolute hidden left-6 md:left-8 top-1/2 z-20 sm:flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-background/50 backdrop-blur-[3px] transition-colors hover:bg-background/70 hover:backdrop-blur-[3px]"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Publication suivante"
            className="absolute hidden right-6 md:right-8 top-1/2 z-20 sm:flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-background/50 backdrop-blur-[3px] transition-colors hover:bg-background/70 hover:backdrop-blur-[3px]"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-20 sm:px-20 md:px-28 md:pb-26">
        <div className="max-w-xl">
          <h1
            className={`text-xl font-extrabold uppercase leading-tight transition-colors duration-500 sm:text-2xl md:text-3xl ${
              isDarkImage ? "text-white" : "text-gray-950"
            }`}
          >
            {current.title}
          </h1>
          <p
            className={`mt-3 line-clamp-3 text-sm transition-colors duration-500 sm:text-base md:text-sm ${
              isDarkImage ? "text-white/90" : "text-gray-800"
            }`}
          >
            {current.summary}
          </p>
          <Link
            href={`/posts/${current.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Voir plus
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {props.posts.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 sm:right-10 md:right-16">
          {props.posts.map((post, i) => (
            <button
              type="button"
              key={post.id}
              onClick={() => goTo(i)}
              aria-label={`Aller à la publication ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
