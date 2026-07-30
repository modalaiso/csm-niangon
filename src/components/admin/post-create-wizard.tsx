"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  FileText,
  Info,
  Megaphone,
  Loader2,
} from "lucide-react";
import type { PostType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ContentEditor } from "@/components/admin/content-editor";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";
import { AnnouncementDurationSelect } from "@/components/admin/announcement-duration-select";
import { createPost } from "@/app/actions/admin-posts";

const STEPS = [
  { id: 1, label: "Type" },
  { id: 2, label: "Titre" },
  { id: 3, label: "Description" },
  { id: 4, label: "Contenu" },
  { id: 5, label: "Visuels" },
] as const;

const TYPE_OPTIONS: {
  value: PostType;
  label: string;
  description: string;
  Icon: typeof Newspaper;
}[] = [
  { value: "ACTU", label: "Actu", description: "Actualité récente du CSM Niangon", Icon: Newspaper },
  { value: "ARTICLE", label: "Article", description: "Contenu approfondi, dossier ou reportage", Icon: FileText },
  { value: "INFO", label: "Info", description: "Information courte, visible dans la barre défilante", Icon: Info },
  {
    value: "ANNONCE",
    label: "Annonce",
    description: "S'affiche en pop-up à l'arrivée sur le site, avec une durée de vie définie",
    Icon: Megaphone,
  },
];

const MAX_IMAGES = 15;

export function PostCreateWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<PostType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnnouncement = type === "ANNONCE";

  const canGoNext = () => {
    if (step === 1) return type !== null;
    if (step === 2) return title.trim().length >= 5;
    if (step === 3) return summary.trim().length >= 10;
    if (step === 4) return content.trim().length >= 20;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const buildTags = () => {
    const parsed = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (type === "INFO" && isUrgent && !parsed.some((t) => t.toLowerCase() === "urgent")) {
      parsed.push("urgent");
    }
    return parsed;
  };

  const handleSubmit = (status: "DRAFT" | "PUBLISHED") => {
    if (!type || !canGoNext()) return;
    setError(null);
    startTransition(async () => {
      const result = await createPost({
        type,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        // Procédure différente selon le type : jamais d'image pour une ANNONCE
        images: isAnnouncement ? [] : images,
        expiresAt: isAnnouncement ? expiresAt : null,
        tags: buildTags(),
        status,
      });

      if ("error" in result) {
        if (result.error === "auth_required") {
          router.push("/login");
          return;
        }
        setError("Impossible d'enregistrer ce post. Vérifiez les champs et réessayez.");
        return;
      }

      // Les annonces n'ont pas de page dédiée : elles ne vivent qu'en pop-up.
      // On redirige vers l'accueil pour voir le pop-up apparaître directement.
      if (type === "ANNONCE") {
        router.push("/");
        return;
      }

      router.push(`/posts/${result.id}`);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Indicateur d'étapes */}
      <ol className="mb-8 flex items-center justify-between">
        {STEPS.map((s, index) => (
          <li key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  step === s.id
                    ? "border-primary bg-primary text-white"
                    : step > s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  step === s.id ? "text-primary" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                  step > s.id ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="p-6 sm:p-8">
        {/* Étape 1 : type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-foreground">Quel type de post créez-vous ?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Le type détermine où et comment votre publication sera mise en avant.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                    type === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                      type === option.value ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <option.Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>

            {type === "INFO" && (
              <label className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-secondary"
                />
                Marquer comme urgent (mis en avant dans la barre d&apos;information)
              </label>
            )}
          </div>
        )}

        {/* Étape 2 : titre */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-foreground">Donnez un titre à votre post</h2>
            <p className="mt-1 text-sm text-muted-foreground">Au moins 5 caractères, clair et accrocheur.</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Finale de la coupe inter-classes remportée par la Terminale C"
              maxLength={120}
              className="mt-6 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">{title.length}/120</p>
          </div>
        )}

        {/* Étape 3 : description */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-foreground">Ajoutez une description</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ce résumé apparaît sur les cartes et dans les résultats de recherche.
            </p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Résumez votre publication en quelques phrases..."
              rows={5}
              className="mt-6 w-full resize-y rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">{summary.length} caractères</p>
          </div>
        )}

        {/* Étape 4 : contenu */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-foreground">Rédigez le contenu complet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Utilisez la barre d&apos;outils pour mettre en forme : sous-titres, gras, italique, notes et listes.
              {isAnnouncement && " Ce contenu s'affichera dans le pop-up de l'annonce."}
            </p>
            <div className="mt-6">
              <ContentEditor value={content} onChange={setContent} />
            </div>
          </div>
        )}

        {/* Étape 5 : visuels — procédure différente selon le type */}
        {step === 5 && (
          <div>
            {isAnnouncement ? (
              <>
                <h2 className="text-lg font-bold text-foreground">Durée de vie de l&apos;annonce</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Les annonces ne comportent pas d&apos;image : elles s&apos;affichent en pop-up dès l&apos;arrivée
                  sur le site, pour la durée que vous choisissez.
                </p>
                <div className="mt-6 max-w-sm">
                  <AnnouncementDurationSelect value={expiresAt} onChange={setExpiresAt} />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-foreground">Ajoutez vos visuels</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  La première image sert de miniature sur les cartes. Vous pouvez en ajouter jusqu&apos;à{" "}
                  {MAX_IMAGES} et en supprimer à tout moment.
                </p>
                <div className="mt-6">
                  <MultiImageUploadField value={images} onChange={setImages} max={MAX_IMAGES} />
                </div>
              </>
            )}

            <div className="mt-6">
              <label htmlFor="tags" className="mb-2 block text-sm font-medium text-foreground">
                Tags (séparés par des virgules)
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="sport, coupe, terminale"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1 || isPending}
            className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                disabled={isPending}
                className="rounded-full border border-input bg-white px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enregistrer en brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={isPending}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Publier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}