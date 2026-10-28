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

function getBackgroundColor(): [number, number, number] {
  const [hue, saturation, lightness] = getComputedStyle(
    document.documentElement,
  )
    .getPropertyValue("--background")
    .trim()
    .split(/\s+/)
    .map((value) => Number.parseFloat(value));
  const h = (hue % 360) / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h * 6) % 2) - 1));
  const match = Math.floor(h * 6);
  let channels: [number, number, number];
  switch (match) {
    case 0:
      channels = [chroma, x, 0];
      break;
    case 1:
      channels = [x, chroma, 0];
      break;
    case 2:
      channels = [0, chroma, x];
      break;
    case 3:
      channels = [0, x, chroma];
      break;
    case 4:
      channels = [x, 0, chroma];
      break;
    default:
      channels = [chroma, 0, x];
  }
  const [red, green, blue] = channels;
  const offset = l - chroma / 2;

  return [
    Math.round((red + offset) * 255),
    Math.round((green + offset) * 255),
    Math.round((blue + offset) * 255),
  ];
}

function isImageDark(
  image: HTMLImageElement,
  section: HTMLElement,
  text: HTMLElement,
): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = Math.max(
    1,
    Math.round((canvas.width * section.clientHeight) / section.clientWidth),
  );

  const context = canvas.getContext("2d");
  if (!context) {
    console.warn(
      "Impossible d'analyser la luminosité de l'image du carrousel.",
    );
    return false;
  }

  const scale = Math.max(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight,
  );
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (canvas.width - imageWidth) / 2,
    (canvas.height - imageHeight) / 2,
    imageWidth,
    imageHeight,
  );
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const sectionBounds = section.getBoundingClientRect();
  const textBounds = text.getBoundingClientRect();
  const left = Math.max(
    0,
    Math.floor(
      ((textBounds.left - sectionBounds.left) / sectionBounds.width) *
        canvas.width,
    ),
  );
  const right = Math.min(
    canvas.width,
    Math.ceil(
      ((textBounds.right - sectionBounds.left) / sectionBounds.width) *
        canvas.width,
    ),
  );
  const top = Math.max(
    0,
    Math.floor(
      ((textBounds.top - sectionBounds.top) / sectionBounds.height) *
        canvas.height,
    ),
  );
  const bottom = Math.min(
    canvas.height,
    Math.ceil(
      ((textBounds.bottom - sectionBounds.top) / sectionBounds.height) *
        canvas.height,
    ),
  );
  const background = getBackgroundColor();
  const hasHorizontalGradient = window.matchMedia("(min-width: 640px)").matches;
  let luminance = 0;
  let pixels = 0;

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const offset = (y * canvas.width + x) * 4;
      const alpha = data[offset + 3] / 255;
      const verticalOpacity = Math.max(0, 2 * (y / canvas.height) - 1);
      const horizontalOpacity = hasHorizontalGradient
        ? Math.max(0, 1 - 2 * (x / canvas.width))
        : 0;
      const overlayOpacity =
        1 - (1 - verticalOpacity) * (1 - horizontalOpacity);
      const red =
        (data[offset] * alpha + background[0] * (1 - alpha)) *
          (1 - overlayOpacity) +
        background[0] * overlayOpacity;
      const green =
        (data[offset + 1] * alpha + background[1] * (1 - alpha)) *
          (1 - overlayOpacity) +
        background[1] * overlayOpacity;
      const blue =
        (data[offset + 2] * alpha + background[2] * (1 - alpha)) *
          (1 - overlayOpacity) +
        background[2] * overlayOpacity;

      luminance += (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      pixels++;
    }
  }

  return pixels > 0 && luminance / pixels < 0.45;
}

export function HeroCarousel(props: Readonly<HeroCarouselProps>) {
  const [index, setIndex] = useState(0);
  const [isDarkImage, setIsDarkImage] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
        if (sectionRef.current && textRef.current) {
          setIsDarkImage(
            isImageDark(image, sectionRef.current, textRef.current),
          );
        }
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
      <section className="relative flex h-70 w-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5 px-4 text-center md:h-95">
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
      ref={sectionRef}
      className="relative h-105 w-full touch-pan-y overflow-hidden sm:h-120 md:h-140"
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

      <div className="absolute inset-0 hidden bg-linear-to-r from-background via-transparent to-transparent sm:flex" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

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
        <div ref={textRef} className="max-w-xl">
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
