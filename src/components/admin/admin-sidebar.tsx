"use client";

import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircle,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProfileMenu } from "@/components/nav/profile-menu";
import type { AuthenticatedUser } from "@/lib/auth/admin-guard";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: AuthenticatedUser;
}

const OVERVIEW_ITEM = {
  href: "/admin",
  label: "Vue d’ensemble",
  Icon: LayoutDashboard,
};
const NAV_GROUPS = [
  {
    label: "Contenus",
    items: [
      { href: "/admin/posts", label: "Publications", Icon: FileText },
      {
        href: "/admin/schedules",
        label: "Emplois du temps",
        Icon: CalendarClock,
      },
    ],
  },
  {
    label: "Communauté",
    items: [
      { href: "/admin/comments", label: "Commentaires", Icon: MessageCircle },
      { href: "/admin/moderation", label: "Modération", Icon: ShieldAlert },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/about", label: "Page À propos", Icon: Building2 },
      { href: "/admin/users", label: "Utilisateurs", Icon: Users },
    ],
  },
] as const;

function canAccessPath(role: Role, href: string) {
  if (href === "/admin/posts" || href === "/admin/schedules") {
    return role === "WRITER" || role === "ADMIN";
  }
  if (href === "/admin/comments" || href === "/admin/moderation") {
    return role === "MODERATOR" || role === "ADMIN";
  }
  return role === "ADMIN";
}

interface SidebarLinksProps {
  role: Role;
  onNavigate?: () => void;
}

function SidebarLink({
  href,
  label,
  Icon,
  isActive,
  onNavigate,
}: Readonly<{
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onNavigate?: () => void;
}>) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-10 items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary bg-primary/10 text-foreground"
          : "border-transparent text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function SidebarLinks(props: Readonly<SidebarLinksProps>) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessPath(props.role, item.href)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Navigation d’administration" className="space-y-5">
      <SidebarLink
        {...OVERVIEW_ITEM}
        isActive={pathname === "/admin"}
        onNavigate={props.onNavigate}
      />
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h2 className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarLink
                key={item.href}
                {...item}
                isActive={pathname.startsWith(item.href)}
                onNavigate={props.onNavigate}
              />
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function AdminSidebar(props: Readonly<AdminSidebarProps>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isMobileOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !mobileMenuRef.current) return;
      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background px-3 py-5 md:flex">
        <Link href="/admin" className="mb-7 flex items-center gap-3 px-2">
          <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              CSM Niangon
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Administration
            </span>
          </span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarLinks role={props.user.role} />
        </div>
        <Link
          href="/"
          className="mt-4 flex min-h-10 items-center gap-3 border-t border-border px-3 pt-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au site
        </Link>
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-2.5 md:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold text-foreground">
            CSM Niangon
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ProfileMenu
            nom={props.user.nom}
            prenom={props.user.prenom}
            username={props.user.username}
            avatar={props.user.avatar}
            email={props.user.email}
          />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Ouvrir le menu d’administration"
            aria-expanded={isMobileOpen}
            aria-controls="admin-mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-foreground/35"
          />
          <dialog
            open
            id="admin-mobile-menu"
            ref={mobileMenuRef}
            aria-modal="true"
            aria-labelledby="admin-mobile-menu-title"
            className="absolute inset-y-0 left-0 m-0 flex max-h-none max-w-none w-[min(19rem,88vw)] flex-col border-r border-border bg-background p-4"
          >
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <span
                id="admin-mobile-menu-title"
                className="text-sm font-semibold text-foreground"
              >
                Navigation
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMobileMenu}
                aria-label="Fermer"
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarLinks
                role={props.user.role}
                onNavigate={closeMobileMenu}
              />
            </div>
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="mt-4 flex min-h-11 items-center gap-3 border-t border-border pt-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour au site
            </Link>
          </dialog>
        </div>
      )}
    </>
  );
}
