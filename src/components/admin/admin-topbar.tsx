"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const pageLabel = pathname.startsWith("/admin/posts/new")
    ? "Nouvelle publication"
    : pathname.match(/^\/admin\/posts\/[^/]+\/edit$/)
      ? "Modifier une publication"
      : pathname.startsWith("/admin/posts")
        ? "Publications"
        : pathname.startsWith("/admin/schedules/")
          ? "Emploi du temps"
          : pathname.startsWith("/admin/schedules")
            ? "Emplois du temps"
            : pathname.startsWith("/admin/comments")
              ? "Commentaires"
              : pathname.startsWith("/admin/moderation")
                ? "Modération"
                : pathname.startsWith("/admin/users")
                  ? "Utilisateurs"
                  : "Vue d’ensemble";

  return (
    <header className="sticky top-0 z-30 hidden min-h-14 items-center justify-between border-b border-border bg-background px-6 py-2 md:flex">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">CSM Niangon</span>
        <span aria-hidden="true" className="text-border">
          /
        </span>
        <span className="font-medium text-foreground">{pageLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {props.user.prenom} {props.user.nom}
          </p>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[props.user.role] ?? props.user.role}
          </p>
        </div>
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
