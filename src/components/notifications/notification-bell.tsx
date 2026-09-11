"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/app/actions/notifications";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function formatRelative(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

const POLL_INTERVAL_MS = 30000;

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCount();
    const interval = window.setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refreshCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setIsLoading(true);
      getMyNotifications(8)
        .then((result) => {
          if ("notifications" in result) setNotifications(result.notifications);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setIsOpen(false);
    if (!item.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(item.id);
    }
    router.push(item.link);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead().then(() => {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup")
  ) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
      >
        <Bell className="h-5 w-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-4 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Chargement...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Aucune notification pour l'instant.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/50",
                    !n.isRead && "bg-primary/5",
                  )}
                >
                  {n.actor ? (
                    <Avatar
                      username={n.actor.username}
                      avatar={n.actor.avatar}
                      nom={n.actor.nom}
                      prenom={n.actor.prenom}
                      className="h-8 w-8"
                    />
                  ) : (
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                  )}
                </button>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-accent/50"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
