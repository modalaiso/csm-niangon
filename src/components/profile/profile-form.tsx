"use client";

import { Loader2, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logout } from "@/app/actions/auth";
import {
  deleteMyAccount,
  type MyProfile,
  updateMyProfile,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileFormProps {
  profile: MyProfile;
}

const CLASS_OPTIONS = [
  "Sixième",
  "Cinquième",
  "Quatrième",
  "Troisième",
  "Seconde",
  "Premiere",
  "Terminal",
  "Parent d'élève",
];

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Veuillez vérifier les champs saisis.",
  email_taken: "Cet email est déjà utilisé par un autre compte.",
  matricule_taken: "Ce matricule appartient déjà à un autre utilisateur.",
  unknown: "Une erreur est survenue. Réessayez.",
};

export function ProfileForm(props: Readonly<ProfileFormProps>) {
  const router = useRouter();
  const [classe, setClasse] = useState(props.profile.classe);
  const [matricule, setMatricule] = useState(props.profile.matricule ?? "");
  const [email, setEmail] = useState(props.profile.email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const emailChanged =
    email.trim().toLowerCase() !== props.profile.email.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateMyProfile({ classe, matricule, email });
      if ("error" in result) {
        if (result.error === "auth_required") {
          router.push("/login");
          return;
        }
        setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.unknown);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteMyAccount();
      if ("error" in result) {
        if (result.error === "auth_required") {
          router.push("/login");
          return;
        }
        if (result.error === "last_admin") {
          setDeleteError(
            "Impossible de supprimer ce compte : il doit rester au moins un administrateur.",
          );
          return;
        }
        setDeleteError("Impossible de supprimer le compte. Réessayez.");
        return;
      }
      router.push("/");
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={props.profile.nom} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-1.5">
            <Label>Prénoms</Label>
            <Input
              value={props.profile.prenom}
              disabled
              className="bg-muted/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Nom d&apos;utilisateur</Label>
          <Input
            value={props.profile.username}
            disabled
            className="bg-muted/50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classe">Classe</Label>
          <Select value={classe} onValueChange={setClasse}>
            <SelectTrigger id="classe" className="bg-white">
              <SelectValue placeholder="Sélectionner votre classe" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="matricule">Matricule</Label>
          <Input
            id="matricule"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="Ex : 12346789A"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailChanged && (
            <p className="text-xs text-muted-foreground">
              Un email de confirmation pourra vous être envoyé à la nouvelle
              adresse.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && !error && (
          <p className="text-sm text-primary">Profil mis à jour avec succès.</p>
        )}

        <Button type="submit" disabled={isPending} className="text-white">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </form>

      {/* Se déconnecter */}
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:underline disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </button>

      {/* Zone de suppression de compte */}
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-sm font-semibold text-destructive">
          Zone de danger
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La suppression de votre compte est définitive : les contenus liés à ce
          compte seront supprimés. Cette action est irréversible.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 gap-1.5 text-white"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <Label htmlFor="confirm-delete" className="text-sm">
              Tapez <span className="font-semibold">SUPPRIMER</span> pour
              confirmer
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
            />
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={confirmText !== "SUPPRIMER" || isDeleting}
                onClick={handleDelete}
                className="gap-1.5 text-white"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmer la suppression
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmText("");
                  setDeleteError(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
