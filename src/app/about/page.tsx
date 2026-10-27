import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAboutPageContent } from "@/lib/about-page";

export const metadata: Metadata = {
  title: "À propos de nous | CSM Niangon",
  description:
    "Découvrez la communauté du CSM Niangon, sa mission, sa vision et les valeurs qui la rassemblent.",
};

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-muted/30">
        <div className="container grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {content.subtitle}
            </p>
            <Link
              href="/actus"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Découvrir nos actualités
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <aside
            aria-label="La communauté CSM Niangon"
            className="relative overflow-hidden border border-border bg-background p-7 sm:p-9"
          >
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10"
            />
            <img
              src="/100years.png"
              alt="Emblème du CSM Niangon"
              width={104}
              height={104}
              className="relative h-24 w-24 object-contain"
            />
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Une communauté scolaire
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              Informer, partager, avancer ensemble.
            </p>
            <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
              <HeartHandshake
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              Au service de la réussite des enfants
            </div>
          </aside>
        </div>
      </section>

      <section
        aria-label="Notre mission et notre vision"
        className="container max-w-6xl px-4 py-14 sm:py-20"
      >
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <article>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {content.missionTitle}
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {content.missionText}
            </p>
          </article>
          <article className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {content.visionTitle}
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {content.visionText}
            </p>
          </article>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="container grid max-w-6xl gap-8 px-4 py-14 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {content.valuesTitle}
            </h2>
          </div>
          <p className="whitespace-pre-line border-l-2 border-primary/40 pl-5 text-lg leading-8 text-muted-foreground">
            {content.valuesText}
          </p>
        </div>
      </section>
    </main>
  );
}
