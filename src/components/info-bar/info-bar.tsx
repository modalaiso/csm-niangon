"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Megaphone } from "lucide-react";
import type { InfoBarItem } from "@/app/actions/infobar";

interface InfoBarProps {
  items: InfoBarItem[];
}

export function InfoBar({ items }: InfoBarProps) {
  const pathname = usePathname();

  // Masquée sur les pages d'auth, comme TopNav/BottomNav
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup")
  ) {
    return null;
  }

  if (!items || items.length === 0) return null;

  const hasUrgent = items.some((item) => item.isUrgent);
  // On duplique la liste pour un défilement en boucle sans coupure
  const track = [...items, ...items];

  return (
    <div
      role="region"
      aria-label="Informations importantes"
      className={`w-full overflow-hidden border-b ${
        hasUrgent
          ? "bg-secondary text-secondary-foreground border-secondary/60"
          : "bg-primary/10 text-primary border-primary/20"
      }`}
    >
      <div className="group flex py-2">
        <div className="flex w-max animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
          {track.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={`/posts/${item.id}`}
              className="flex items-center gap-2 px-6 text-sm font-medium hover:underline"
            >
              {item.isUrgent ? (
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Megaphone className="h-4 w-4 flex-shrink-0" />
              )}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}