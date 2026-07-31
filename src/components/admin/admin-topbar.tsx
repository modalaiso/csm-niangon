"use client";

import type { AuthenticatedUser } from "@/lib/auth/admin-guard";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

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
    <header className="sticky top-0 hidden items-center justify-end gap-3 border-b border-border bg-white px-6 py-4 md:flex">
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          {props.user.prenom} {props.user.nom}
        </p>
        <p className="text-xs text-muted-foreground">
          {ROLE_LABELS[props.user.role] ?? props.user.role}
        </p>
      </div>
      <Avatar
        username={props.user.username}
        avatar={props.user.avatar}
        nom={props.user.nom}
        prenom={props.user.prenom}
      />
    </header>
  );
}