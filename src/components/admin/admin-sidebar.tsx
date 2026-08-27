"use client";

import type { Role } from "@prisma/client";
import {
  ArrowLeft,
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
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  role: Role;
}

const OVERVIEW_ITEM = {
  href: "/admin",
  label: "Vue d'ensemble",
  Icon: LayoutDashboard,
};
const POST_ITEMS = [
  { href: "/admin/posts", label: "Publications", Icon: FileText },
  { href: "/admin/schedules", label: "Emplois du temps", Icon: CalendarClock },
];
const MODERATION_ITEMS = [
  { href: "/admin/comments", label: "Commentaires", Icon: MessageCircle },
  { href: "/admin/moderation", label: "Modération", Icon: ShieldAlert },
];
const ADMIN_ITEMS = [
  { href: "/admin/users", label: "Utilisateurs", Icon: Users },
];

function getNavItems(role: Role) {
  const items = [OVERVIEW_ITEM];
  if (role === "WRITER" || role === "ADMIN") items.push(...POST_ITEMS);
  if (role === "MODERATOR" || role === "ADMIN") items.push(...MODERATION_ITEMS);
  if (role === "ADMIN") items.push(...ADMIN_ITEMS);
  return items;
}

interface SidebarLinksProps {
  role: Role;
  onNavigate?: () => void;
}

function SidebarLinks(props: Readonly<SidebarLinksProps>) {
  const pathname = usePathname();
  const items = getNavItems(props.role);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={props.onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="my-2 h-px bg-border" />
      <Link
        href="/"
        onClick={props.onNavigate}
        className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au site
      </Link>
    </nav>
  );
}

export function AdminSidebar(props: Readonly<AdminSidebarProps>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 border-r border-border bg-white px-3 py-6 md:block z-40">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="text-sm font-bold text-primary">Dashboard</span>
        </Link>
        <SidebarLinks role={props.role} />
      </aside>

      {/* Mobile topbar + menu */}
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-7 w-7" />
          <span className="text-sm font-bold text-primary">Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-full p-2 text-foreground hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-primary">Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-2 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks
              role={props.role}
              onNavigate={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
