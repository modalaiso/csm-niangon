import React from "react";

/**
 * Découpe une ligne en segments pour le rendu inline : gras, italique,
 * liens Markdown [texte](url) et URLs brutes (https://...).
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\s)]+\)|https?:\/\/[^\s]+)/g;
  const parts = text.split(pattern).filter((part) => part !== "");

  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    const mdLinkMatch = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(part);
    if (mdLinkMatch) {
      const [, label, url] = mdLinkMatch;
      return (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline' }}
          className="text-primary hover:text-primary/80"
        >
          {label}
        </a>
      );
    }

    if (/^https?:\/\//.test(part)) {
      // On retire la ponctuation finale (., ,, ;, ), etc.) du lien lui-même
      const trailingMatch = /[.,;:!?)]+$/.exec(part);
      const trailing = trailingMatch ? trailingMatch[0] : "";
      const url = trailing ? part.slice(0, -trailing.length) : part;
      return (
        <React.Fragment key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}
            className="text-primary hover:text-primary/80"
          >
            {url}
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

type Block =
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function toBlocks(content: string): Block[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: Block[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push({ type: "quote", text: line.slice(2) });
      continue;
    }
    if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "list") {
        last.items.push(line.slice(2));
      } else {
        blocks.push({ type: "list", items: [line.slice(2)] });
      }
      continue;
    }
    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

/**
 * Rend un contenu texte enrichi sous forme de JSX. Syntaxe supportée :
 * **gras**, *italique*, ## Sous-titre, > Note, - Élément de liste,
 * [texte](url) et les URLs brutes (https://...).
 *
 * Utilisé à la fois par la page de détail d'un post et le pop-up
 * d'annonces, pour un rendu cohérent partout dans l'app.
 */
export function renderPostContent(content: string): React.ReactNode {
  const blocks = toBlocks(content);

  return (
    <>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.type === "heading") {
          return (
            <h3 key={key} className="mb-2 mt-4 text-lg font-bold text-foreground first:mt-0">
              {renderInline(block.text, key)}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="mb-3 border-l-4 border-primary/40 bg-primary/5 py-2 pl-4 text-sm italic text-muted-foreground"
            >
              {renderInline(block.text, key)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={key} className="mb-3 list-disc space-y-1 pl-5 text-sm text-foreground/90">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="mb-1 text-sm leading-relaxed text-foreground/90">
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </>
  );
}