import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  /** null/omis = notification diffusée à tous les utilisateurs */
  recipientId?: string | null;
  actorId?: string | null;
}

async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        recipientId: input.recipientId ?? null,
        actorId: input.actorId ?? null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
  }
}

const POST_TYPE_LABELS: Record<string, string> = {
  ACTU: "actualité",
  INFO: "information",
  ANNONCE: "annonce",
};

// Types de post pour lesquels on notifie tous les utilisateurs.
// (ARTICLE volontairement exclu — moins prioritaire, pas mentionné dans le besoin)
const BROADCAST_POST_TYPES = new Set(["ACTU", "INFO", "ANNONCE"]);

/** Notifie tous les utilisateurs d'une nouvelle publication INFO/ACTU/ANNONCE */
export async function notifyNewPost(post: {
  id: string;
  type: string;
  title: string;
  authorId: string;
}) {
  if (!BROADCAST_POST_TYPES.has(post.type)) return;

  const label = POST_TYPE_LABELS[post.type] ?? "publication";
  await createNotification({
    type: "NEW_POST",
    title: `Nouvelle ${label}`,
    body: post.title,
    link: `/posts/${post.id}`,
    recipientId: null,
    actorId: post.authorId,
  });
}

/** Notifie l'auteur d'un commentaire qu'on lui a répondu */
export async function notifyCommentReply(params: {
  parentAuthorId: string;
  actorId: string;
  actorPseudo: string;
  postId: string;
  replyContent: string;
}) {
  if (params.parentAuthorId === params.actorId) return; // pas de notif à soi-même
  await createNotification({
    type: "COMMENT_REPLY",
    title: `${params.actorPseudo} a repondu à votre commentaire`,
    body: params.replyContent.slice(0, 140),
    link: `/posts/${params.postId}`,
    recipientId: params.parentAuthorId,
    actorId: params.actorId,
  });
}

/** Notifie l'auteur d'un commentaire qu'il a reçu un like */
export async function notifyCommentLike(params: {
  commentAuthorId: string;
  actorId: string;
  actorPseudo: string;
  postId: string;
}) {
  if (params.commentAuthorId === params.actorId) return;
  await createNotification({
    type: "COMMENT_LIKE",
    title: `${params.actorPseudo} a aimé votre commentaire`,
    body: "",
    link: `/posts/${params.postId}`,
    recipientId: params.commentAuthorId,
    actorId: params.actorId,
  });
}

/** Notifie l'auteur d'un post qu'il a reçu un like */
export async function notifyPostLike(params: {
  postAuthorId: string;
  actorId: string;
  postId: string;
  postTitle: string;
}) {
  if (params.postAuthorId === params.actorId) return;
  await createNotification({
    type: "POST_LIKE",
    title: "Quelqu'un a aimé votre publication",
    body: params.postTitle,
    link: `/posts/${params.postId}`,
    recipientId: params.postAuthorId,
    actorId: params.actorId,
  });
}
