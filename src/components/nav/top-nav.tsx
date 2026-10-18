"use client";

import type { Role } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, Menu, ShieldUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileMenu } from "@/components/nav/profile-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SearchDropdown } from "@/components/search/search-dropdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface TopNavProfile {
  nom: string;
  prenom: string;
  username: string;
  avatar: string | null;
  email: string | null;
}

interface TopNavProps {
  user?: User | null;
  userRole?: Role;
  userProfile?: TopNavProfile | null;
}

function SchoolSpaceMenu({ mobile = false }: Readonly<{ mobile?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = mobile ? "school-space-menu-mobile" : "school-space-menu";

  return (
    <div
      className={mobile ? "relative" : "group relative"}
      onMouseEnter={mobile ? undefined : () => setIsOpen(true)}
      onMouseLeave={mobile ? undefined : () => setIsOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() =>
          setIsOpen((open) => (mobile ? !open : true))
        }
        className={
          mobile
            ? "flex w-full items-center justify-between py-1 text-left text-sm font-medium hover:underline"
            : `flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                isOpen ? "text-primary" : "text-muted-foreground"
              }`
        }
      >
        Mon espace scolaire
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={
            mobile
              ? "mt-2 flex flex-col rounded-lg border border-border bg-background p-1"
              : "absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
          }
        >
          <Link
            href="/emplois-du-temps"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            Emplois du temps
          </Link>
          <div
            role="menuitem"
            aria-disabled="true"
            className="flex cursor-not-allowed items-center justify-between gap-2 px-3 py-2 text-sm text-muted-foreground"
          >
            Calendrier des devoirs
            <span className="text-[10px]">Bientôt disponible</span>
          </div>
          <div
            role="menuitem"
            aria-disabled="true"
            className="flex cursor-not-allowed items-center justify-between gap-2 px-3 py-2 text-sm text-muted-foreground"
          >
            Mes notes et moyennes
            <span className="text-[10px]">Bientôt disponible</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopNav(props: Readonly<TopNavProps>) {
  const pathname = usePathname();

  // Hide on auth pages and on the whole admin dashboard (qui a sa propre topbar)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const isWriterOrAdminOrModerator =
    props.userRole === "WRITER" ||
    props.userRole === "ADMIN" ||
    props.userRole === "MODERATOR";

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/actus", label: "Actualités" },
    { href: "/infos", label: "Infos" },
    { href: "/about", label: "À propos de nous" },
  ];

  const navLinksMobile = [
    { href: "/", label: "Accueil" },
    { href: "/actus", label: "Actualités" },
    { href: "/articles", label: "Articles" },
    { href: "/infos", label: "Infos" },
    { href: "/about", label: "À propos de nous" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background shadow-[0_4px_12px_#0000000a]">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className=" items-center inline-block">
          <Link href="/" className="flex items-center gap-2 ml-2">
            <img
              src="/logo.png"
              alt="CSM Niangon"
              width={40}
              height={40}
              loading="eager"
            />
            <span className="text-[.875rem] leading-[1rem] font-semibold font-heading text-primary hidden sm:block">
              CSM Niangon
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex container h-14 items-center justify-center px-4">
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {props.user && <SchoolSpaceMenu />}
          </nav>
        </div>

        {/* Right: Search & Menu/Auth */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-sm">
            <SearchDropdown />
          </div>

          {/* Bouton de création de post, réservé aux rédacteurs et admins */}
          {isWriterOrAdminOrModerator && (
            <Link href="/admin" className="hidden lg:block">
              <Button size="sm" className="rounded-full text-white gap-1.5">
                <ShieldUser className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}

          {/* Desktop Auth / Profile */}
          <div className="hidden lg:flex items-center gap-2">
            {props.user && props.userProfile ? (
              <>
                <NotificationBell />
                <ProfileMenu
                  nom={props.userProfile.nom}
                  prenom={props.userProfile.prenom}
                  username={props.userProfile.username}
                  avatar={props.userProfile.avatar}
                  email={props.userProfile.email}
                />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full  bg-transparent"
                  >
                    Se connecter
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-white rounded-full">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden gap-1 items-center">
            <SearchDropdown />
            {props.user && <NotificationBell />}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                >
                  <Menu className="h-5 w-5 stroke-primary" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Liens de navigation du site
                </SheetDescription>
                <div className="flex flex-col gap-4 py-4">
                  <div className="items-center inline-block">
                    <div className="flex items-center gap-2 ml-2">
                      <img
                        src="/logo.png"
                        alt="CSM Niangon"
                        width={40}
                        height={40}
                        loading="eager"
                      />
                      <span className="text-[.875rem] leading-[1rem] font-semibold text-primary block">
                        CSM <br />
                        Niangon
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navLinksMobile.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {props.user && <SchoolSpaceMenu mobile />}
                    {isWriterOrAdminOrModerator && (
                      <>
                        <div className="h-px bg-border my-2" />
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          Dashboard
                        </Link>
                      </>
                    )}
                    {props.user ? (
                      <>
                        <div className="h-px bg-border my-2" />
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          Paramètres
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="h-px bg-border my-2" />
                        <Link
                          href="/login"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/signup"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          S'inscrire
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
