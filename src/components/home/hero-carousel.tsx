"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { HomePostCard } from "@/app/actions/posts";

interface HeroCarouselProps {
  posts: HomePostCard[];
}

export function HeroCarousel({ posts }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [posts.length]);

  // Aucune publication : pas de post inventé, message d'accueil sobre
  if (posts.length === 0) {
    return (
      <section className="relative flex h-[280px] w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-4 text-center md:h-[380px]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Bienvenue sur CSM Niangon TV
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Aucun post pour l&apos;instant. Revenez bientôt !
          </p>
        </div>
      </section>
    );
  }

  const current = posts[index];
  const goTo = (i: number) =>
    setIndex(((i % posts.length) + posts.length) % posts.length);

  return (
    <section className="relative h-[420px] w-full overflow-hidden sm:h-[480px] md:h-[560px]">
      {posts.map((post, i) => (
        <img
          key={post.id}
          src={post.thumbnail ?? "/logo-g.png"}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Voile pour la lisibilité du texte, comme sur la maquette */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

      {posts.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Publication précédente"
            className="shadow-lg absolute left-6 md:left-8 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-white/50 backdrop-blur-[3px] transition-colors hover:bg-white/70 hover:backdrop-blur-[3px]"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Publication suivante"
            className="shadow-lg absolute right-6 md:right-8 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-white/50 backdrop-blur-[3px] transition-colors hover:bg-white/70 hover:backdrop-blur-[3px]"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 px-16 pb-20 sm:px-20 md:px-28 md:pb-26">
        <div className="max-w-xl">
          <h1 className="text-2xl font-extrabold uppercase leading-tight text-gray-900 sm:text-3xl md:text-4xl">
            {current.title}
          </h1>
          <p className="mt-3 line-clamp-3 text-sm text-gray-700 sm:text-base md:text-sm">
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

      {posts.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 sm:right-10 md:right-16">
          {posts.map((post, i) => (
            <button
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