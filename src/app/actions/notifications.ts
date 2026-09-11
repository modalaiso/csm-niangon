"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  createdAt: Date;
  isRead: boolean;
  actor: {
    username: string;
    prenom: string;
    nom: string;
    avatar: string | null;
  } | null;
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type GetNotificationsResult =
  | { notifications: NotificationItem[] }
  | { error: "auth_required" };

/** Notifications de l'utilisateur courant : personnelles + diffusées à tous */
export async function getMyNotifications(
  limit: number = 30,
): Promise<GetNotificationsResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "auth_required" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ recipientId: userId }, { recipientId: null }] },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { username: true, prenom: true, nom: true, avatar: true },
        },
        reads: { where: { userId }, select: { id: true } },
      },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        createdAt: n.createdAt,
        isRead: n.reads.length > 0,
        actor: n.actor,
      })),
    };
  } catch (error) {
    console.error("Erreur lors du chargement des notifications:", error);
    return { notifications: [] };
  }
}

/** Nombre de notifications non lues (perso + diffusées), pour le badge de la cloche */
export async function getUnreadNotificationCount(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  try {
    // Query directly for unread notifications instead of calculating total - read
    // This avoids issues with deleted notifications or orphaned read records
    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ recipientId: userId }, { recipientId: null }],
        reads: {
          none: {
            userId,
          },
        },
      },
    });

    return Math.max(0, unreadCount);
  } catch (error) {
    console.error("Erreur lors du calcul des notifications non lues:", error);
    return 0;
  }
}

type SimpleResult = { success: true } | { error: "auth_required" | "unknown" };

export async function markNotificationRead(
  notificationId: string,
): Promise<SimpleResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "auth_required" };

  try {
    await prisma.notificationRead.upsert({
      where: { notificationId_userId: { notificationId, userId } },
      create: { notificationId, userId },
      update: {},
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error);
    return { error: "unknown" };
  }
}

export async function markAllNotificationsRead(): Promise<SimpleResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "auth_required" };

  try {
    const unread = await prisma.notification.findMany({
      where: {
        OR: [{ recipientId: userId }, { recipientId: null }],
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unread.length > 0) {
      await prisma.notificationRead.createMany({
        data: unread.map((n) => ({ notificationId: n.id, userId })),
        skipDuplicates: true,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage global des notifications:", error);
    return { error: "unknown" };
  }
}
