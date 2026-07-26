import * as React from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const partKey = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={partKey} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={partKey} className="italic text-slate-600">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={partKey}>{part}</React.Fragment>;
  });
}

/**
 * Rendu du contenu simplifié type "GitHub/Word" :
 * **gras**, *italique*, "## " sous-titre, "> " note, "- " liste à puces.
 * Utilisé à la fois par la page de détail (server) et l'aperçu de l'éditeur (client).
 */
export function renderPostContent(content: string): React.ReactNode {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    const items = listBuffer;
    listBuffer = [];
    blocks.push(
      <ul
        key={`list-${key}`}
        className="mb-3 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700"
      >
        {items.map((item, i) => (
          <li key={`list-${key}-${i}`}>{renderInline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, index) => {
    const key = String(index);

    if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2).trim());
      return;
    }
    flushList(key);

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key} className="mb-3 mt-6 text-xl font-bold text-slate-900">
          {renderInline(line.slice(3).trim(), `h-${key}`)}
        </h2>,
      );
      return;
    }

    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key}
          className="mb-3 rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-[15px] italic leading-relaxed text-slate-700"
        >
          {renderInline(line.slice(2).trim(), `bq-${key}`)}
        </blockquote>,
      );
      return;
    }

    blocks.push(
      <p key={key} className="mb-3 text-[15px] leading-relaxed text-slate-700">
        {renderInline(line, `p-${key}`)}
      </p>,
    );
  });

  flushList("end");

  return blocks;
}