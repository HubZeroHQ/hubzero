"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import clsx from "clsx";

interface MarkdownPreviewProps {
  value: string;
  className?: string;
}

/**
 * Remove leading YAML frontmatter (`--- ... ---`) so only content is rendered.
 */
function stripFrontmatter(markdown: string): string {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) return markdown;

  const lines = trimmed.split("\n");
  let endIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) return markdown; // malformed frontmatter, leave as is

  return lines.slice(endIndex + 1).join("\n").trimStart();
}

export default function MarkdownPreview({ value, className }: MarkdownPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function processMarkdown() {
      try {
        const body = stripFrontmatter(value);
        const file = await remark().use(html).process(body);
        if (!cancelled) {
          setHtmlContent(String(file));
        }
      } catch (error) {
        console.error("Error processing markdown:", error);
        if (!cancelled) {
          setHtmlContent("<p style='color:#f87171'>Error rendering preview.</p>");
        }
      }
    }

    void processMarkdown();

    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div
      className={clsx(
        "prose prose-invert max-w-none text-sm md:text-base",
        "prose-headings:text-slate-50 prose-p:text-slate-200",
        "prose-li:marker:text-slate-400 prose-hr:border-slate-700",
        "prose-blockquote:border-slate-600 prose-blockquote:text-slate-300",
        "prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-xl",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
