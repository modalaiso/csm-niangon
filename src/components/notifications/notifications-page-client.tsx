"use client";

import {
  Bell,
  Megaphone,
  MessageCircle,
  Newspaper,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/app/actions/notifications";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationsPageClientProps {
  initialNotifications: NotificationItem[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  NEW_POST: Newspaper,
  COMMENT_REPLY: MessageCircle,
  COMMENT_LIKE: ThumbsUp,
  POST_LIKE: ThumbsUp,
  HOMEWORK_DUE: Megaphone,
};

export function NotificationsPageClient(
  props: Readonly<NotificationsPageClientProps>,
) {
  const [notifications, setNotifications] = useState(
    props.initialNotifications,
  );
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = (item: NotificationItem) => {
    if (item.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );
    startTransition(() => {
      markNotificationRead(item.id);
    });
  };

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleMarkAll}
            className="rounded-full"
          >
            Tout marquer comme lu ({unreadCount})
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <Bell className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucune notification pour l'instant.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <Link
                  href={n.link}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-4 transition-colors hover:bg-accent/40",
                    !n.isRead && "bg-primary/5",
                  )}
                >
                  {n.actor ? (
                    <Avatar
                      username={n.actor.username}
                      avatar={n.actor.avatar}
                      nom={n.actor.nom}
                      prenom={n.actor.prenom}
                    />
                  ) : (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-secondary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
