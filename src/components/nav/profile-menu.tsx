"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/app/actions/auth";

interface ProfileMenuProps {
  nom: string;
  prenom: string;
  username: string;
  avatar: string | null;
  email: string | null;
}

/**
 * Bouton profil du top nav (desktop uniquement). Ouvre un menu déroulant
 * donnant accès à la page profil, aux paramètres du compte (actuellement
 * regroupés sur la même page /profile) et à la déconnexion.
 */
export function ProfileMenu(props: Readonly<ProfileMenuProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Ouvrir le menu profil"
        className="flex items-center rounded-full p-1 transition-colors hover:bg-accent"
      >
        <Avatar
          username={props.username}
          avatar={props.avatar}
          nom={props.nom}
          prenom={props.prenom}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-4 w-56 overflow-hidden rounded-2xl border border-border bg-white"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {props.prenom} {props.nom}
            </p>
            {props.email && (
              <p className="truncate text-xs text-muted-foreground">{props.email}</p>
            )}
          </div>

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent"
          >
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Mon profil
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Paramètres
          </Link>

          <div className="h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}