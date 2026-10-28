import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAboutPageContent } from "@/lib/about-page";

export const metadata: Metadata = {
  title: "À propos de nous | CSM Niangon",
  description:
    "Découvrez la communauté du CSM Niangon, sa mission, sa vision et les valeurs qui la rassemblent.",
};

const valueIcons = [ShieldCheck, HeartHandshake, Sparkles, BookOpen];

export default async function AboutPage() {
  const content = await getAboutPageContent();
  const values = content.valuesText
    .split(/\n+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <main className="overflow-hidden bg-[#f7f8f3]">
      <section className="relative isolate overflow-hidden bg-[#123b2b] text-white">
        <Image
          src="/bg.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="z-0 object-cover object-center opacity-25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-gradient-to-r from-[#0c2e22] via-[#123b2b]/90 to-[#123b2b]/55"
        />
        <div
          aria-hidden="true"
          className="absolute -right-36 -top-40 z-10 h-[34rem] w-[34rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 z-10 h-[25rem] w-[25rem] rounded-full border border-white/10"
        />

        <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#f6c453]" />
              {content.eyebrow}
            </p>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              {content.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/actus"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f6c453] px-6 text-sm font-bold text-[#173c2c] transition hover:bg-[#ffda7c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123b2b]"
              >
                Suivre nos actualités
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#notre-engagement"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Découvrir notre engagement
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className="relative mx-auto w-full max-w-sm lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rotate-3 rounded-[2rem] border border-white/15"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#f8f7ed] p-7 text-[#173c2c] shadow-2xl shadow-black/20 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#52715d]">
                    Notre établissement
                  </p>
                  <p className="mt-2 text-2xl font-semibold leading-tight">
                    Une école,
                    <br />
                    une communauté.
                  </p>
                </div>
                <GraduationCap
                  className="h-8 w-8 shrink-0 text-[#4c9a53]"
                  aria-hidden="true"
                />
              </div>
              <div className="my-7 h-px bg-[#dfe5d8]" />
              <div className="flex items-center gap-5">
                <Image
                  src="/logo.png"
                  alt="Emblème du CSM Niangon"
                  width={100}
                  height={100}
                  className="h-[4.5rem] w-[4.5rem] object-contain"
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">
                    CSM Niangon
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#52715d]">
                    Apprendre, grandir et réussir ensemble.
                  </p>
                </div>
              </div>
              <div className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#52715d]">
                <HeartHandshake
                  className="h-4 w-4 text-[#4c9a53]"
                  aria-hidden="true"
                />
                Au service de chaque élève
              </div>
            </div>
          </aside>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 h-2 bg-gradient-to-r from-[#f6c453] via-[#f6c453] to-[#4c9a53]" />
      </section>

      <section
        id="notre-engagement"
        className="scroll-mt-24 border-b border-[#e5e9df] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4c9a53]">
              Notre engagement
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#183b2c] sm:text-3xl">
              Faire grandir toute une communauté
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Élèves, familles et équipe éducative avancent ensemble. Chaque
            parcours compte, chaque réussite se construit dans la confiance,
            l’écoute et le goût d’apprendre.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4c9a53]">
              Ce qui nous guide
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[#183b2c] sm:text-4xl">
              Une ambition portée par des convictions fortes.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">
            À chaque étape de la scolarité, nous plaçons l’épanouissement et la
            progression de l’élève au cœur de notre action.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="group rounded-[1.5rem] border border-[#e4e9df] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#183b2c]/5 sm:p-9">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4e9] text-[#398645]">
                <Target className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold tracking-[0.16em] text-[#a6b9a2]">
                01
              </span>
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.15em] text-[#4c9a53]">
              Notre mission
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#183b2c]">
              {content.missionTitle}
            </h3>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600">
              {content.missionText}
            </p>
          </article>

          <article className="group rounded-[1.5rem] border border-[#e4e9df] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#183b2c]/5 sm:p-9">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9] text-[#b77d12]">
                <Lightbulb className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold tracking-[0.16em] text-[#c8b98f]">
                02
              </span>
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.15em] text-[#b77d12]">
              Notre vision
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#183b2c]">
              {content.visionTitle}
            </h3>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600">
              {content.visionText}
            </p>
          </article>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#123b2b] text-white">
        <div
          aria-hidden="true"
          className="absolute -left-28 -top-32 h-96 w-96 rounded-full border border-white/10"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f6c453]">
                Notre signature
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {content.valuesTitle}
              </h2>
              <p className="mt-4 max-w-sm text-base leading-7 text-white/65">
                Des repères partagés qui inspirent notre communauté au
                quotidien.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {values.map((value, index) => {
                const Icon = valueIcons[index % valueIcons.length];
                return (
                  <article
                    key={`${index}-${value}`}
                    className="flex min-h-36 items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6c453]/15 text-[#f6c453]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="whitespace-pre-line pt-1 text-base font-medium leading-7 text-white/90">
                      {value}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="flex flex-col gap-8 rounded-[1.75rem] bg-[#eaf2e6] p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#398645]">
              CSM Niangon
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#183b2c] sm:text-3xl">
              La vie de l’école se construit ensemble.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Retrouvez les nouvelles de notre communauté et les informations
              utiles pour accompagner les élèves.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/actus"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f7d3b] px-5 text-sm font-semibold text-white transition hover:bg-[#246431] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7d3b] focus-visible:ring-offset-2"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Nos actualités
            </Link>
            <Link
              href="/emplois-du-temps"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#bdd1b7] bg-white/70 px-5 text-sm font-semibold text-[#183b2c] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7d3b] focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Emplois du temps
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
