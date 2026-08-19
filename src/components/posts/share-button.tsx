"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, X, Check, Link2, Mail, MoreHorizontal } from "lucide-react";
import {
  WhatsAppIcon,
  XSocialIcon,
  FacebookIcon,
  TelegramIcon,
  InstagramIcon,
} from "@/components/icons/social-icons";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  postId: string;
  type: string;
  title: string;
  summary: string;
  thumbnail: string | null;
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  ACTU: { label: "Actu", className: "bg-blue-600" },
  ARTICLE: { label: "Article", className: "bg-emerald-500" },
  INFO: { label: "Info", className: "bg-amber-500" },
  ANNONCE: { label: "Annonce", className: "bg-rose-500" },
};

interface ShareOption {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

export function ShareButton(props: Readonly<ShareButtonProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/posts/${props.postId}`);
    setCanNativeShare(typeof navigator.share === "function");
  }, [props.postId]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    if (isOpen) {
      if (!dialogNode.open) dialogNode.showModal();
    } else if (dialogNode.open) {
      dialogNode.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialogNode) setIsOpen(false);
    };
    dialogNode.addEventListener("click", handleBackdropClick);
    return () => dialogNode.removeEventListener("click", handleBackdropClick);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie du lien:", error);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: props.title, text: props.summary, url: shareUrl });
      setIsOpen(false);
    } catch {
      // Partage annulé par l'utilisateur : rien à faire
    }
  };

  const handleInstagramShare = async () => {
    await handleCopy();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  if (!shareUrl) {
    // Évite un flash sans lien avant l'hydratation côté client
    return (
      <button
        type="button"
        disabled
        className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground opacity-60"
      >
        <Share2 className="h-5 w-5" />
        Partager
      </button>
    );
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(props.title);
  const encodedText = encodeURIComponent(`${props.title} — ${props.summary}`);

  const options: ShareOption[] = [
    ...(canNativeShare
      ? [
          {
            key: "native",
            label: "Autres",
            onClick: handleNativeShare,
            icon: (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground">
                <MoreHorizontal className="h-6 w-6" />
              </span>
            ),
          },
        ]
      : []),
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]">
          <WhatsAppIcon className="h-7 w-7 text-white" />
        </span>
      ),
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
          <XSocialIcon className="h-6 w-6 text-white" />
        </span>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0866FF]">
          <FacebookIcon className="h-7 w-7 text-white" />
        </span>
      ),
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#26A5E4]">
          <TelegramIcon className="h-7 w-7 text-white" />
        </span>
      ),
    },
    {
      key: "instagram",
      label: "Instagram",
      onClick: handleInstagramShare,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
          <InstagramIcon className="h-7 w-7 text-white" />
        </span>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
      icon: (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-foreground" />
        </span>
      ),
    },
  ];

  const badge = TYPE_BADGES[props.type] ?? { label: props.type, className: "bg-gray-500" };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Share2 className="h-5 w-5" />
        Partager
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Partager : ${props.title}`}
        onClose={() => setIsOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl p-0 backdrop:bg-black/50 open:flex open:flex-col"
      >
        <div className="flex max-h-[85vh] w-full flex-col overflow-hidden bg-white">
          {/* En-tête */}
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-base font-bold text-foreground">Partager</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Aperçu du post : type, miniature, titre, description */}
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
            <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              {props.thumbnail ? (
                <img src={props.thumbnail} alt={props.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  Pas d&apos;image
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{props.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{props.summary}</p>
            </div>
          </div>

          {/* Options de partage */}
          <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((option) => {
              const content = (
                <>
                  {option.icon}
                  <span className="mt-1.5 whitespace-nowrap text-xs text-muted-foreground">
                    {option.label}
                  </span>
                </>
              );

              if (option.href) {
                return (
                  <a
                    key={option.key}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-shrink-0 flex-col items-center"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={option.onClick}
                  className="flex flex-shrink-0 flex-col items-center"
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* Lien à copier */}
          <div className="mx-5 mb-5 mt-5 flex items-center gap-2 rounded-full border border-border bg-muted/40 py-2 pl-4 pr-2">
            <Link2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{shareUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white transition-colors",
                copied ? "bg-primary" : "bg-foreground hover:bg-foreground/90",
              )}
            >
              {copied && <Check className="h-4 w-4" />}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}