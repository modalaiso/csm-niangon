"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Minus,
  Pencil,
  Quote,
  Strikethrough,
} from "lucide-react";
import type { ClipboardEvent, DragEvent } from "react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { renderPostContent } from "@/lib/render-post-content";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUploadChange?: (isUploading: boolean) => void;
}

const BUCKET = "post-images";
const MAX_IMAGE_SIZE = 6 * 1024 * 1024;
const MAX_IMAGES_PER_UPLOAD = 10;
const IMAGE_TYPES: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ContentEditor(props: Readonly<ContentEditorProps>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(props.value);
  valueRef.current = props.value;
  const selectionRef = useRef({ start: 0, end: 0 });
  const linkDialogStateRef = useRef<{
    selectionStart: number;
    selectionEnd: number;
    selected: string;
    value: string;
  } | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rememberSelection = (textarea: HTMLTextAreaElement) => {
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  };

  const replaceSelection = (
    prefix: string,
    suffix = prefix,
    placeholder = "texte",
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const nextValue =
      value.slice(0, selectionStart) +
      prefix +
      selected +
      suffix +
      value.slice(selectionEnd);
    props.onChange(nextValue);
    valueRef.current = nextValue;
    const selection = {
      start: selectionStart + prefix.length,
      end: selectionStart + prefix.length + selected.length,
    };
    selectionRef.current = selection;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selection.start, selection.end);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const nextNewline = value.indexOf("\n", selectionEnd);
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const shouldRemove = lines.every((line) => line.startsWith(prefix));
    const updatedBlock = lines
      .map((line) =>
        shouldRemove ? line.slice(prefix.length) : `${prefix}${line}`,
      )
      .join("\n");
    const nextValue =
      value.slice(0, lineStart) + updatedBlock + value.slice(lineEnd);
    props.onChange(nextValue);
    valueRef.current = nextValue;
    selectionRef.current = {
      start: lineStart,
      end: lineStart + updatedBlock.length,
    };
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end,
      );
    });
  };

  const applyHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const nextNewline = value.indexOf("\n", selectionEnd);
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;
    const line = value.slice(lineStart, lineEnd);
    const heading = `${"#".repeat(level)} `;
    const updatedLine = /^#{1,6}\s/.test(line)
      ? line.replace(/^#{1,6}\s/, heading)
      : `${heading}${line}`;
    const nextValue =
      value.slice(0, lineStart) + updatedLine + value.slice(lineEnd);
    props.onChange(nextValue);
    valueRef.current = nextValue;
    selectionRef.current = {
      start: lineStart,
      end: lineStart + updatedLine.length,
    };
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end,
      );
    });
  };

  const applyOrderedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const nextNewline = value.indexOf("\n", selectionEnd);
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;
    const lines = value.slice(lineStart, lineEnd).split("\n");
    const shouldRemove = lines.every((line) => /^\d+\. /.test(line));
    let count = 1;
    const updatedBlock = lines
      .map((line) => {
        if (shouldRemove) return line.replace(/^\d+\. /, "");
        return `${count++}. ${line}`;
      })
      .join("\n");
    const nextValue =
      value.slice(0, lineStart) + updatedBlock + value.slice(lineEnd);
    props.onChange(nextValue);
    valueRef.current = nextValue;
    selectionRef.current = {
      start: lineStart,
      end: lineStart + updatedBlock.length,
    };
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end,
      );
    });
  };

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    linkDialogStateRef.current = {
      selectionStart,
      selectionEnd,
      selected: value.slice(selectionStart, selectionEnd) || "texte du lien",
      value,
    };
    setLinkUrl("https://");
    setError(null);
    setIsLinkDialogOpen(true);
  };

  const handleConfirmLink = () => {
    const state = linkDialogStateRef.current;
    if (!state || !linkUrl.trim()) return;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(linkUrl.trim());
    } catch {
      setError("Entrez une adresse de lien valide.");
      return;
    }
    if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
      setError("Ce type de lien n'est pas autorisé.");
      return;
    }

    const markdown = `[${state.selected.replaceAll("]", "\\]")}](${linkUrl.trim()})`;
    const nextValue =
      state.value.slice(0, state.selectionStart) +
      markdown +
      state.value.slice(state.selectionEnd);
    props.onChange(nextValue);
    valueRef.current = nextValue;
    setIsLinkDialogOpen(false);
    setError(null);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const cursor = state.selectionStart + markdown.length;
        textarea.setSelectionRange(cursor, cursor);
        selectionRef.current = { start: cursor, end: cursor };
      }
    });
  };

  const insertUploadedImages = (images: { alt: string; url: string }[]) => {
    const value = valueRef.current;
    const { start, end } = selectionRef.current;
    const insertionPoint = Math.min(start, value.length);
    const before = value.slice(0, insertionPoint);
    const after = value.slice(Math.max(start, end));
    const markdown = images
      .map(({ alt, url }) => `![${alt}](${url})`)
      .join("\n\n");
    const leading = before && !before.endsWith("\n\n") ? "\n\n" : "";
    const trailing = after && !after.startsWith("\n\n") ? "\n\n" : "";
    const insertion = `${leading}${markdown}${trailing}`;
    const nextValue = `${before}${insertion}${after}`;
    props.onChange(nextValue);
    valueRef.current = nextValue;
    const cursor = before.length + insertion.length;
    selectionRef.current = { start: cursor, end: cursor };
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      }
    });
  };

  const handleImageFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);

    const candidates = files.slice(0, MAX_IMAGES_PER_UPLOAD);
    const warnings: string[] = [];
    if (files.length > MAX_IMAGES_PER_UPLOAD) {
      warnings.push(
        `10 images maximum par ajout ; les premières sont traitées.`,
      );
    }
    const validFiles = candidates.filter((file) => {
      if (!IMAGE_TYPES[file.type]) {
        warnings.push(
          `${file.name || "Un fichier"} n'est pas une image prise en charge.`,
        );
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        warnings.push(`${file.name || "Une image"} dépasse la limite de 6 Mo.`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) {
      setError(warnings.join(" "));
      return;
    }

    setIsUploading(true);
    props.onImageUploadChange?.(true);
    try {
      const supabase = createClient();
      const uploaded: { alt: string; url: string }[] = [];
      for (const file of validFiles) {
        const extension = IMAGE_TYPES[file.type];
        const path = `content/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });
        if (uploadError) {
          console.error("Erreur upload Supabase:", uploadError);
          warnings.push(`Échec de l'envoi de ${file.name || "une image"}.`);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const alt = (file.name || "Image")
          .replace(/\.[^.]+$/, "")
          .replace(/[()[\]\\]/g, " ")
          .trim();
        uploaded.push({ alt: alt || "Image", url: data.publicUrl });
      }

      if (uploaded.length > 0) insertUploadedImages(uploaded);
      setError(warnings.length > 0 ? warnings.join(" ") : null);
    } catch (uploadError) {
      console.error("Erreur lors de l'envoi des images:", uploadError);
      setError(
        "Une erreur inattendue est survenue pendant l'envoi des images.",
      );
    } finally {
      setIsUploading(false);
      props.onImageUploadChange?.(false);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const images = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (images.length > 0) {
      event.preventDefault();
      rememberSelection(event.currentTarget);
      void handleImageFiles(images);
    }
  };

  const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) event.preventDefault();
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length > 0) {
      rememberSelection(event.currentTarget);
      void handleImageFiles(images);
    } else if (files.length > 0) {
      setError("Seuls les fichiers image peuvent être déposés ici.");
    }
  };

  const toolbarButtons = [
    {
      label: "Gras (Ctrl+B)",
      icon: Bold,
      action: () => replaceSelection("**"),
    },
    {
      label: "Italique (Ctrl+I)",
      icon: Italic,
      action: () => replaceSelection("*"),
    },
    {
      label: "Barré",
      icon: Strikethrough,
      action: () => replaceSelection("~~"),
    },
    { label: "Titre principal", icon: Heading1, action: () => applyHeading(1) },
    { label: "Titre", icon: Heading2, action: () => applyHeading(2) },
    { label: "Sous-titre", icon: Heading3, action: () => applyHeading(3) },
    {
      label: "Liste à puces",
      icon: List,
      action: () => applyLinePrefix("- "),
    },
    { label: "Liste numérotée", icon: ListOrdered, action: applyOrderedList },
    {
      label: "Liste à cocher",
      icon: ListChecks,
      action: () => applyLinePrefix("- [ ] "),
    },
    {
      label: "Citation",
      icon: Quote,
      action: () => applyLinePrefix("> "),
    },
    { label: "Code", icon: Code, action: () => replaceSelection("`") },
    {
      label: "Bloc de code",
      icon: Code,
      action: () => replaceSelection("```\n", "\n```", "votre code"),
    },
    { label: "Lien (Ctrl+K)", icon: Link2, action: applyLink },
    {
      label: "Séparateur",
      icon: Minus,
      action: () => replaceSelection("\n---\n", "", ""),
    },
  ];

  return (
    <div className="relative rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={button.action}
              disabled={mode === "preview" || isUploading}
              title={button.label}
              aria-label={button.label}
              className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              <button.icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => imageInputRef.current?.click()}
            disabled={mode === "preview" || isUploading}
            title="Insérer une image"
            aria-label="Insérer une image"
            className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <input
            ref={imageInputRef}
            id="content-image-input"
            type="file"
            accept={Object.keys(IMAGE_TYPES).join(",")}
            multiple
            className="hidden"
            onChange={(event) => {
              void handleImageFiles(
                Array.from(event.currentTarget.files ?? []),
              );
              event.currentTarget.value = "";
            }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={cn(
              "flex min-h-9 items-center gap-1 rounded-sm px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "edit"
                ? "bg-background text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Écrire
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "flex min-h-9 items-center gap-1 rounded-sm px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "preview"
                ? "bg-background text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Aperçu
          </button>
        </div>
      </div>

      <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
        Mise en forme comme dans Word : sélectionnez un texte, puis choisissez
        un outil. Glissez ou collez des images JPG, PNG, WEBP, GIF ou AVIF (6 Mo
        maximum).
        {isUploading && (
          <span
            className="ml-2 inline-flex items-center gap-1"
            aria-live="polite"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Envoi des images…
          </span>
        )}
      </p>
      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={props.value}
          onChange={(event) => {
            props.onChange(event.target.value);
            valueRef.current = event.target.value;
            rememberSelection(event.currentTarget);
          }}
          onSelect={(event) => rememberSelection(event.currentTarget)}
          onPaste={handlePaste}
          onDragEnter={(event) => {
            if (Array.from(event.dataTransfer.types).includes("Files")) {
              event.preventDefault();
              setIsDragging(true);
            }
          }}
          onDragOver={(event) => {
            if (Array.from(event.dataTransfer.types).includes("Files")) {
              event.preventDefault();
              setIsDragging(true);
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            const shortcut = event.key.toLowerCase();
            if (shortcut === "b") {
              event.preventDefault();
              replaceSelection("**");
            } else if (shortcut === "i") {
              event.preventDefault();
              replaceSelection("*");
            } else if (shortcut === "k") {
              event.preventDefault();
              applyLink();
            }
          }}
          placeholder="Commencez à écrire votre publication ici…"
          className="min-h-[360px] w-full resize-y rounded-b-2xl bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label="Contenu de la publication"
        />
      ) : (
        <div className="min-h-[360px] px-4 py-3">
          {props.value.trim() ? (
            renderPostContent(props.value)
          ) : (
            <p className="text-sm text-muted-foreground">
              Rien à prévisualiser pour le moment.
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="border-t border-border px-4 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/90 p-6 text-center text-sm font-semibold text-primary">
          Déposez vos images pour les insérer dans le texte
        </div>
      )}

      <Dialog.Root
        open={isLinkDialogOpen}
        onOpenChange={(open) => {
          setIsLinkDialogOpen(open);
          if (!open) setError(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Dialog.Title className="text-lg font-semibold">
                  Ajouter un lien
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Entrez l'adresse URL du lien.
                </Dialog.Description>
              </div>
              <Input
                type="url"
                placeholder="https://exemple.com"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleConfirmLink();
                }}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  className="rounded-md bg-primarys2-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primarys2-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
