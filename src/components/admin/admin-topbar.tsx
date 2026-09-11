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
    <header className="sticky top-0 hidden items-center justify-end gap-3 border-b border-border bg-background px-6 py-4 md:flex z-40">
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          {props.user.prenom} {props.user.nom}
        </p>
        <p className="text-xs text-muted-foreground">
          {ROLE_LABELS[props.user.role] ?? props.user.role}
        </p>
      </div>
      <div className="mt-2">
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
