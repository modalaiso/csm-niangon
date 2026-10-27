"use client";

import { useActionState } from "react";
import { saveAboutPageContent } from "@/app/actions/admin-about";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AboutPageContent } from "@/lib/about-page";

const INITIAL_STATE = { status: "idle", message: "" } as const;

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
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        maxLength={maxLength}
        required
      />
      <p className="text-xs text-muted-foreground">
        {maxLength} caractères maximum.
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
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        maxLength={maxLength}
        required
        rows={5}
        className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <p className="text-xs text-muted-foreground">
        {maxLength} caractères maximum. Les retours à la ligne sont conservés.
      </p>
    </div>
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
    <form action={formAction} className="space-y-6">
      <section className="space-y-5 rounded-lg border border-border bg-background p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Introduction
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Le bandeau affiché en haut de la page publique.
          </p>
        </div>
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
      </section>

      <section className="space-y-5 rounded-lg border border-border bg-background p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Notre mission
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Expliquez le rôle de la communauté et de la plateforme.
          </p>
        </div>
        <TextField
          name="missionTitle"
          label="Titre de la section"
          value={content.missionTitle}
          maxLength={100}
        />
        <TextAreaField
          name="missionText"
          label="Texte"
          value={content.missionText}
        />
      </section>

      <section className="space-y-5 rounded-lg border border-border bg-background p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Notre vision
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Présentez l’ambition et les objectifs de la communauté.
          </p>
        </div>
        <TextField
          name="visionTitle"
          label="Titre de la section"
          value={content.visionTitle}
          maxLength={100}
        />
        <TextAreaField
          name="visionText"
          label="Texte"
          value={content.visionText}
        />
      </section>

      <section className="space-y-5 rounded-lg border border-border bg-background p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Nos valeurs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Une valeur par ligne pour une présentation lisible.
          </p>
        </div>
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
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
        {state.message && (
          <p
            aria-live="polite"
            className={
              state.status === "success"
                ? "text-sm text-green-700 dark:text-green-400"
                : "text-sm text-destructive"
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
