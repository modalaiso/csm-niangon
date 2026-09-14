"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  Link2,
  List,
  Pencil,
  Quote,
} from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { renderPostContent } from "@/lib/render-post-content";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContentEditor(props: Readonly<ContentEditorProps>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const linkDialogStateRef = useRef<{
    selectionStart: number;
    selectionEnd: number;
    selected: string;
    value: string;
  } | null>(null);

  const applyWrap = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "texte";
    const nextValue =
      value.slice(0, selectionStart) +
      prefix +
      selected +
      suffix +
      value.slice(selectionEnd);
    props.onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor =
        selectionStart + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;

    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    let lineEnd = value.indexOf("\n", selectionEnd);
    if (lineEnd === -1) lineEnd = value.length;

    const block = value.slice(lineStart, lineEnd);
    const updatedBlock = block
      .split("\n")
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join("\n");

    const nextValue =
      value.slice(0, lineStart) + updatedBlock + value.slice(lineEnd);
    props.onChange(nextValue);
    requestAnimationFrame(() => textarea.focus());
  };

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected =
      value.slice(selectionStart, selectionEnd) || "texte du lien";

    linkDialogStateRef.current = {
      selectionStart,
      selectionEnd,
      selected,
      value,
    };
    setLinkUrl("https://");
    setIsLinkDialogOpen(true);
  };

  const handleConfirmLink = () => {
    const state = linkDialogStateRef.current;
    if (!state || !linkUrl?.trim()) {
      const textarea = textareaRef.current;
      if (textarea) textarea.focus();
      setIsLinkDialogOpen(false);
      return;
    }

    const markdown = `[${state.selected}](${linkUrl.trim()})`;
    const nextValue =
      state.value.slice(0, state.selectionStart) +
      markdown +
      state.value.slice(state.selectionEnd);
    props.onChange(nextValue);
    setIsLinkDialogOpen(false);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const cursor = state.selectionStart + markdown.length;
        textarea.setSelectionRange(cursor, cursor);
      }
    });
  };

  const toolbarButtons = [
    { label: "Gras", icon: Bold, action: () => applyWrap("**") },
    { label: "Italique", icon: Italic, action: () => applyWrap("*") },
    {
      label: "Sous-titre",
      icon: Heading2,
      action: () => applyLinePrefix("## "),
    },
    { label: "Note", icon: Quote, action: () => applyLinePrefix("> ") },
    { label: "Liste à puces", icon: List, action: () => applyLinePrefix("- ") },
    { label: "Lien", icon: Link2, action: applyLink },
  ];

  return (
    <div className="rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              disabled={mode === "preview"}
              title={btn.label}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              mode === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Éditer
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              mode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Aperçu
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={
            "Rédigez le contenu ici...\n\nUtilisez la barre d'outils ou tapez directement :\n**gras**, *italique*, ## Sous-titre, > Note, - Point, https://exemple.com"
          }
          className="min-h-[320px] w-full resize-y rounded-b-2xl px-4 py-3 bg-background text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      ) : (
        <div className="min-h-[320px] px-4 py-3">
          {props.value.trim() ? (
            renderPostContent(props.value)
          ) : (
            <p className="text-sm text-muted-foreground">
              Rien à prévisualiser pour le moment.
            </p>
          )}
        </div>
      )}

      <Dialog.Root open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
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
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmLink();
                  } else if (e.key === "Escape") {
                    setIsLinkDialogOpen(false);
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
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
