"use client";

import Link from "next/link";
import { Menu, ShieldUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { SearchDropdown } from "@/components/search/search-dropdown";
import { ProfileMenu } from "@/components/nav/profile-menu";

import type { User } from "@supabase/supabase-js";
import type { Role } from "@prisma/client";

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

  const isWriterOrAdmin = props.userRole === "WRITER" || props.userRole === "ADMIN";

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/actus", label: "Actualités" },
    { href: "/infos", label: "Infos" },
    { href: "/emplois-du-temps", label: "Emplois du temps" },
    { href: "/devoirs", label: "Calendriers des devoirs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className=" items-center inline-block">
          <Link href="/" className="flex items-center gap-2 ml-2">
            <img
              src="/logo.png"
              alt="CSM Niangon TV"
              width={40}
              height={40}
              loading="eager"
            />
            <span className="text-[.875rem] leading-[1rem] font-semibold text-primary hidden sm:block">CSM Niangon</span>
          </Link>
        </div>

        <div className="hidden md:flex container h-14 items-center justify-center px-4">
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
          </nav>
        </div>

        {/* Right: Search & Menu/Auth */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
            <SearchDropdown />
          </div>

          {/* Bouton de création de post, réservé aux rédacteurs et admins */}
          {isWriterOrAdmin && (
            <Link href="/admin" className="hidden md:block">
              <Button size="sm" className="rounded-full text-white gap-1.5">
                <ShieldUser className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}

          {/* Desktop Auth / Profile */}
          <div className="hidden md:flex items-center gap-2">
            {props.user && props.userProfile ? (
              <ProfileMenu
                nom={props.userProfile.nom}
                prenom={props.userProfile.prenom}
                username={props.userProfile.username}
                avatar={props.userProfile.avatar}
                email={props.userProfile.email}
              />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">
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
          <div className="flex md:hidden gap-1">
            <SearchDropdown />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5 stroke-primary" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col gap-4 py-4">
                  <img src="/logo-g.png" alt="Logo" width={50} />
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {isWriterOrAdmin && (
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
                          className="text-sm font-medium hover:underline"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/signup"
                          className="text-sm font-medium hover:underline"
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