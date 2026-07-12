import Markdown from "react-markdown";
import type { Components } from "react-markdown";

import { cn } from "@/lib/utils";

const components: Components = {
  p: ({ children }) => <p className="text-body text-text-muted mt-5 first:mt-0">{children}</p>,
  h2: ({ children }) => <h2 className="text-h2 text-text mt-10 font-normal first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-h3 text-text mt-8 font-normal first:mt-0">{children}</h3>,
  strong: ({ children }) => <strong className="text-text font-medium">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => (
    <code className="text-caption bg-bg-light rounded px-1 py-0.5 font-mono">{children}</code>
  ),
  a: ({ children, href }) => (
    <a href={href} className="text-text underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="text-body text-text-muted mt-5 list-disc space-y-2 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-body text-text-muted mt-5 list-decimal space-y-2 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
};

export interface RichTextProps {
  children: string;
  className?: string;
}

/**
 * The one markdown-rendering pipeline for every `richtext` CMS field
 * (`ARCHITECTURE/09_CMS_ARCHITECTURE.md` §5-6's "one rendering pipeline for
 * editor preview and published output" requirement) — every public page
 * that renders a `problem`/`approach`/`result`/`description`/`body` field
 * (Case Study, Labs, Notes) uses this component, never a second markdown
 * renderer or raw `dangerouslySetInnerHTML`, so preview and published output
 * can never visually diverge (the exact legacy bug class this rule exists
 * to prevent).
 */
export function RichText({ children, className }: RichTextProps) {
  return (
    <div className={cn(className)}>
      <Markdown components={components}>{children}</Markdown>
    </div>
  );
}
