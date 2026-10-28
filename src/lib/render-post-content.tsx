import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-2xl font-bold text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-xl font-bold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-bold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-foreground/90">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/50 underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  ul: ({ children, className }) => (
    <ul
      className={`mb-3 list-disc space-y-1 pl-5 text-sm text-foreground/90 ${className ?? ""}`}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className }) => (
    <ol
      className={`mb-3 list-decimal space-y-1 pl-5 text-sm text-foreground/90 ${className ?? ""}`}
    >
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-primary/40 bg-primary/5 py-2 pl-4 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-border" />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className="my-4 max-h-160 max-w-full rounded-xl object-contain"
    />
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-3 py-2 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2">{children}</td>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-xl bg-muted p-4 text-sm">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-sm">{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    ),
  del: ({ children }) => (
    <del className="text-muted-foreground">{children}</del>
  ),
};

export function renderPostContent(content: string): React.ReactNode {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
