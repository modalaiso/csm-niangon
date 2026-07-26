"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspectClassName?: string;
}

// Bucket Supabase Storage public à créer au préalable dans le dashboard
const BUCKET = "post-images";

export function ImageUploadField(props: Readonly<ImageUploadFieldProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Erreur upload Supabase:", uploadError);
        setError("Échec de l'envoi de l'image. Réessayez.");
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      props.onChange(data.publicUrl);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'image:", err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{props.label}</p>

      {props.value ? (
        <div
          className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${props.aspectClassName ?? "aspect-video"}`}
        >
          <img src={props.value} alt={props.label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => props.onChange(null)}
            aria-label="Retirer l'image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed ${props.aspectClassName ?? "aspect-video"}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Envoi en cours...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm">Cliquer pour ajouter une image</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {props.hint && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{props.hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}