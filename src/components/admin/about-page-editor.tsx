"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Eye,
  HeartHandshake,
  Lightbulb,
  LoaderCircle,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { saveAboutPageContent } from "@/app/actions/admin-about";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AboutPageContent } from "@/lib/about-page";

const INITIAL_STATE = { status: "idle", message: "" } as const;

const EDITOR_SECTIONS: {
  id: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "introduction", label: "Introduction", Icon: Sparkles },
  { id: "mission", label: "Notre mission", Icon: Target },
  { id: "vision", label: "Notre vision", Icon: Lightbulb },
  { id: "values", label: "Nos valeurs", Icon: HeartHandshake },
];

function TextField({
  name,
  label,
  value,
  maxLength,
}: Readonly<{
  name: string;
  label: string;
  value: string;
  maxLength: number;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        maxLength={maxLength}
        required
        className="h-11 rounded-xl bg-background"
      />
      <p className="text-xs text-muted-foreground">
        Jusqu’à {maxLength} caractères.
      </p>
    </div>
  );
}

function TextAreaField({
  name,
  label,
  value,
  maxLength = 5000,
}: Readonly<{
  name: string;
  label: string;
  value: string;
  maxLength?: number;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        maxLength={maxLength}
        required
        rows={5}
        className="flex min-h-36 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 text-foreground ring-offset-background placeholder:text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <p className="text-xs text-muted-foreground">
        Jusqu’à {maxLength} caractères. Les retours à la ligne sont conservés.
      </p>
    </div>
  );
}

function EditorSection({
  id,
  number,
  eyebrow,
  title,
  description,
  Icon,
  children,
}: Readonly<{
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  children: ReactNode;
}>) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
    >
      <div className="flex items-start gap-4 border-b border-border bg-muted/25 px-5 py-5 sm:px-7">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {number}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">{children}</div>
    </section>
  );
}

export function AboutPageEditor({
  content,
}: Readonly<{ content: AboutPageContent }>) {
  const [state, formAction, isPending] = useActionState(
    saveAboutPageContent,
    INITIAL_STATE,
  );

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <form action={formAction} className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#16432f] to-[#276a3a] p-6 text-white shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5 text-[#f6c453]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
                Espace éditorial
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Racontez l’identité du CSM Niangon
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Modifiez les textes qui présentent l’établissement. Vos
                changements seront publiés sur la page À propos après
                enregistrement.
              </p>
            </div>
          </div>
        </div>

        <EditorSection
          id="introduction"
          number="01"
          eyebrow="Le premier regard"
          title="Introduction"
          description="Le titre et le texte du bandeau d’accueil de la page publique."
          Icon={Sparkles}
        >
          <TextField
            name="eyebrow"
            label="Sur-titre"
            value={content.eyebrow}
            maxLength={60}
          />
          <TextField
            name="title"
            label="Titre principal"
            value={content.title}
            maxLength={120}
          />
          <TextAreaField
            name="subtitle"
            label="Texte d’introduction"
            value={content.subtitle}
            maxLength={400}
          />
        </EditorSection>

        <EditorSection
          id="mission"
          number="02"
          eyebrow="Notre rôle"
          title="Notre mission"
          description="Expliquez ce qui rassemble la communauté et guide son action."
          Icon={Target}
        >
          <TextField
            name="missionTitle"
            label="Titre de la mission"
            value={content.missionTitle}
            maxLength={100}
          />
          <TextAreaField
            name="missionText"
            label="Texte de la mission"
            value={content.missionText}
          />
        </EditorSection>

        <EditorSection
          id="vision"
          number="03"
          eyebrow="Notre horizon"
          title="Notre vision"
          description="Présentez l’ambition et les objectifs de la communauté scolaire."
          Icon={Lightbulb}
        >
          <TextField
            name="visionTitle"
            label="Titre de la vision"
            value={content.visionTitle}
            maxLength={100}
          />
          <TextAreaField
            name="visionText"
            label="Texte de la vision"
            value={content.visionText}
          />
        </EditorSection>

        <EditorSection
          id="values"
          number="04"
          eyebrow="Nos repères"
          title="Nos valeurs"
          description="Présentez les convictions qui animent l’établissement."
          Icon={HeartHandshake}
        >
          <TextField
            name="valuesTitle"
            label="Titre de la section"
            value={content.valuesTitle}
            maxLength={100}
          />
          <TextAreaField
            name="valuesText"
            label="Valeurs"
            value={content.valuesText}
          />
          <p className="-mt-2 rounded-xl bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
            Conseil : écrivez une valeur par ligne pour une présentation
            distincte sur la page publique.
          </p>
        </EditorSection>

        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg shadow-black/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p
            aria-live="polite"
            role={state.status === "error" ? "alert" : "status"}
            className={
              state.status === "success"
                ? "flex items-center gap-2 px-2 text-sm font-medium text-green-700 dark:text-green-400"
                : state.status === "error"
                  ? "px-2 text-sm font-medium text-destructive"
                  : "px-2 text-sm text-muted-foreground"
            }
          >
            {state.status === "success" && (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {state.message || "Pensez à enregistrer vos modifications."}
          </p>
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 shrink-0 gap-2 rounded-xl px-5"
          >
            {isPending ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <nav
          aria-label="Sections de la page À propos"
          className="rounded-2xl border border-border bg-background p-4 shadow-sm"
        >
          <p className="px-2 pb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Sections de la page
          </p>
          <div className="space-y-1">
            {EDITOR_SECTIONS.map(({ id, label, Icon }, index) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <span className="text-xs text-muted-foreground">
                  0{index + 1}
                </span>
              </a>
            ))}
          </div>
        </nav>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
            Publication
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Les visiteurs retrouveront ces contenus sur la page publique après
            l’enregistrement.
          </p>
          <Link
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-primary transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ouvrir la page publique
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#e4e9df] bg-[#f2f7ef] p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#398645]">
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#183b2c]">
            Un message à votre image
          </p>
          <p className="mt-1 text-xs leading-5 text-[#52715d]">
            Préférez des phrases courtes, concrètes et accessibles aux élèves
            comme aux familles.
          </p>
        </div>
      </aside>
    </div>
  );
}
