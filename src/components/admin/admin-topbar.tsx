"use client";

import { ProfileMenu } from "@/components/nav/profile-menu";
import type { AuthenticatedUser } from "@/lib/auth/admin-guard";

interface AdminTopbarProps {
  user: AuthenticatedUser;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  WRITER: "Rédacteur",
  MODERATOR: "Modérateur",
  USER: "Utilisateur",
};

export function AdminTopbar(props: Readonly<AdminTopbarProps>) {
  return (
    <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-border/70 bg-background/95 px-6 py-3 backdrop-blur md:flex">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Espace d’administration
        </p>
        <p className="text-xs text-muted-foreground">
          Pilotage et gestion de la plateforme
        </p>
      </div>
      <div className="flex items-center gap-5">
        <span className="hidden items-center gap-2 text-xs text-muted-foreground lg:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {ROLE_LABELS[props.user.role] ?? props.user.role}
        </span>
        <p className="text-sm font-semibold text-foreground">
          {props.user.prenom} {props.user.nom}
        </p>
        <ProfileMenu
          nom={props.user.nom}
          prenom={props.user.prenom}
          username={props.user.username}
          avatar={props.user.avatar}
          email={props.user.email}
        />
      </div>
    </header>
  );
}
