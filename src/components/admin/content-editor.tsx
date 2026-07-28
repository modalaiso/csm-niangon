"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Heading2, Quote, List, Link2, Eye, Pencil } from "lucide-react";
import { renderPostContent } from "@/lib/render-post-content";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContentEditor(props: Readonly<ContentEditorProps>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const applyWrap = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "texte";
    const nextValue =
      value.slice(0, selectionStart) + prefix + selected + suffix + value.slice(selectionEnd);
    props.onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + prefix.length + selected.length + suffix.length;
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

    const nextValue = value.slice(0, lineStart) + updatedBlock + value.slice(lineEnd);
    props.onChange(nextValue);
    requestAnimationFrame(() => textarea.focus());
  };

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "texte du lien";

    const url = window.prompt("Adresse du lien (https://...)", "https://");
    if (!url || !url.trim()) {
      textarea.focus();
      return;
    }

    const markdown = `[${selected}](${url.trim()})`;
    const nextValue = value.slice(0, selectionStart) + markdown + value.slice(selectionEnd);
    props.onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + markdown.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const toolbarButtons = [
    { label: "Gras", icon: Bold, action: () => applyWrap("**") },
    { label: "Italique", icon: Italic, action: () => applyWrap("*") },
    { label: "Sous-titre", icon: Heading2, action: () => applyLinePrefix("## ") },
    { label: "Note", icon: Quote, action: () => applyLinePrefix("> ") },
    { label: "Liste à puces", icon: List, action: () => applyLinePrefix("- ") },
    { label: "Lien", icon: Link2, action: applyLink },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white">
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
              mode === "edit" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
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
              mode === "preview" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
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
          className="min-h-[320px] w-full resize-y rounded-b-2xl px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      ) : (
        <div className="min-h-[320px] px-4 py-3">
          {props.value.trim() ? (
            renderPostContent(props.value)
          ) : (
            <p className="text-sm text-muted-foreground">Rien à prévisualiser pour le moment.</p>
          )}
        </div>
      )}
    </div>
  );
}