"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { type ClipboardEvent, type DragEvent, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  hint?: string;
}

// Même bucket public que ImageUploadField
const BUCKET = "post-images";

export function MultiImageUploadField(
  props: Readonly<MultiImageUploadFieldProps>,
) {
  const max = props.max ?? 15;
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = Math.max(0, max - props.value.length);

  const uploadOne = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Erreur upload Supabase:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFiles = async (files: File[]) => {
    if (uploadInProgressRef.current || files.length === 0) return;

    const images = files.filter((file) => file.type.startsWith("image/"));
    const messages: string[] = [];
    if (images.length < files.length) {
      messages.push("Seuls les fichiers image peuvent être ajoutés.");
    }
    const selected = images.slice(0, remainingSlots);
    if (images.length > remainingSlots) {
      messages.push(
        `Vous ne pouvez ajouter que ${max} images maximum au total.`,
      );
    }
    setError(messages.length > 0 ? messages.join(" ") : null);
    if (selected.length === 0) return;

    uploadInProgressRef.current = true;
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const url = await uploadOne(file);
        if (url) uploaded.push(url);
      }
      if (uploaded.length < selected.length) {
        messages.push(
          "Certaines images n'ont pas pu être envoyées. Réessayez.",
        );
      }
      if (uploaded.length > 0) {
        props.onChange([...props.value, ...uploaded]);
      }
      setError(messages.length > 0 ? messages.join(" ") : null);
    } catch (err) {
      console.error("Erreur lors de l'envoi des images:", err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      uploadInProgressRef.current = false;
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (files.length > 0) {
      event.preventDefault();
      void handleFiles(files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const handleRemove = (index: number) => {
    props.onChange(props.value.filter((_, i) => i !== index));
  };

  return (
    <section
      aria-label="Zone d’ajout des visuels"
      aria-describedby="post-image-upload-hint"
      onPaste={handlePaste}
      onDragEnter={(event) => {
        if (Array.from(event.dataTransfer.types).includes("Files")) {
          event.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes("Files")) {
          event.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
      className={`rounded-md ${isDragging ? "bg-primary/5 ring-2 ring-primary" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Images ({props.value.length}/{max})
        </p>
        {isUploading && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Envoi en cours...
          </span>
        )}
      </div>

      {props.value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {props.value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img
                src={url}
                alt={`Visuel ${index + 1}`}
                width={320}
                height={320}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-primarys2-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Miniature
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Supprimer l'image ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-md bg-black/60 text-white transition-colors hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">
            Ajouter des images ({remainingSlots} restante
            {remainingSlots > 1 ? "s" : ""})
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
      />

      <p
        id="post-image-upload-hint"
        className="mt-1.5 text-xs text-muted-foreground"
      >
        {props.hint ??
          "Déposez vos images ici ou sélectionnez-les. Pour coller une image, cliquez sur « Ajouter des images », puis utilisez Ctrl+V (ou Cmd+V)."}
      </p>
      {error && (
        <p className="mt-1.5 text-xs text-destructive" aria-live="polite">
          {error}
        </p>
      )}
    </section>
  );
}
