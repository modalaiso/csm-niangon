"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  hint?: string;
}

// Même bucket public que ImageUploadField
const BUCKET = "post-images";

export function MultiImageUploadField(props: Readonly<MultiImageUploadFieldProps>) {
  const max = props.max ?? 15;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = max - props.value.length;

  const uploadOne = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const extension = file.name.split(".").pop() ?? "jpg";
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const selected = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`Vous ne pouvez ajouter que ${max} images maximum au total.`);
    }
    if (selected.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const url = await uploadOne(file);
        if (url) uploaded.push(url);
      }
      if (uploaded.length < selected.length) {
        setError("Certaines images n'ont pas pu être envoyées. Réessayez.");
      }
      if (uploaded.length > 0) {
        props.onChange([...props.value, ...uploaded]);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi des images:", err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    props.onChange(props.value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Images ({props.value.length}/{max})
        </p>
        {isUploading && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Envoi en cours...
          </span>
        )}
      </div>

      {props.value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {props.value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
            >
              <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                  Miniature
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Supprimer l'image ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
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
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">
            Ajouter des images ({remainingSlots} restante{remainingSlots > 1 ? "s" : ""})
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {props.hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{props.hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}