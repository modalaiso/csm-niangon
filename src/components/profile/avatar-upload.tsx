"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateMyAvatar } from "@/app/actions/profile";
import { Avatar } from "@/components/ui/avatar";

interface AvatarUploadProps {
  avatar: string | null;
  nom: string;
  prenom: string;
  username: string;
}

// Même bucket public que les images de post (déjà configuré avec les
// policies RLS nécessaires) — les avatars vont dans un sous-dossier dédié.
const BUCKET = "post-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function AvatarUpload(props: Readonly<AvatarUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(props.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `avatars/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Erreur upload avatar:", uploadError);
        setError("L'envoi de l'image a échoué. Réessayez.");
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      startTransition(async () => {
        const result = await updateMyAvatar(data.publicUrl);
        if ("error" in result) {
          setError("Impossible d'enregistrer la photo de profil.");
          return;
        }
        setAvatar(result.avatar);
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'avatar:", err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMyAvatar(null);
      if ("error" in result) {
        setError("Impossible de retirer la photo de profil.");
        return;
      }
      setAvatar(null);
    });
  };

  const busy = isUploading || isPending;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full ring-4 ring-white">
          <Avatar
            avatar={avatar}
            nom={props.nom}
            prenom={props.prenom}
            username={props.username}
            className="h-40 w-40"
            textClassName="text-4xl"
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Changer la photo de profil"
          className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors border-4 border-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-6 w-6" />}
        </button>
      </div>

      {avatar && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          Retirer la photo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}