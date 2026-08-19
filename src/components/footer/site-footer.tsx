"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube } from "lucide-react";
import type { Role } from "@prisma/client";

interface SiteFooterProps {
  userRole?: Role;
}

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/actus", label: "Actualités" },
  { href: "/articles", label: "Articles" },
  { href: "/infos", label: "Infos" },
  { href: "/emplois-du-temps", label: "Emplois du temps" },
  { href: "/devoirs", label: "Devoirs" },
];

const USEFUL_LINKS = [
  { href: "https://dgem.ci", label: "DGEM CI" },
  { href: "https://www.education.gouv.ci", label: "MENA" },
  { href: "https://www.men-deep.com", label: "DEEP" },
  { href: "https://www.men-deco.org/", label: "DECO" },
  { href: "https://mena-desps.org/", label: "DESPS" },
  { href: "https://mendob-ci.org/", label: "DOB" },
]

// Réseaux sociaux du club — à remplacer par les vraies URLs quand disponibles
const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
];

export function SiteFooter(props: Readonly<SiteFooterProps>) {
  const pathname = usePathname();

  // Même règle de masquage que TopNav / BottomNav / InfoBar / AnnouncementPopup
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const isWriterOrAdminOrModerator = props.userRole === "WRITER" || props.userRole === "ADMIN" || props.userRole === "MODERATOR";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <div className="container px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img src="/100years.png" alt="CSM Niangon" width={36} height={36} />
              <span className="text-sm font-bold text-primary">CSM <br/>Niangon</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              La plateforme média officielle du CSM Niangon. Actualités, articles et
              informations de la communauté.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">Navigation</h3>
            <ul className="mt-3 ml-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isWriterOrAdminOrModerator && (
                <li>
                  <Link
                    href="/admin"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">Liens utiles</h3>
            <ul className="mt-3 ml-3 space-y-1">
              {USEFUL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">Compte</h3>
            <ul className="mt-3 ml-3 space-y-1">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  S'inscrire
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} CSM Niangon. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Développé par <a href="https://github.com/modalaiso" target="_blank" className="text-primary hover:underline">modalaiso</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}