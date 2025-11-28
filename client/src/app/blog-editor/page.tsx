"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import clsx from "clsx";
import type { EditorProps } from "@monaco-editor/react";

import {
  parseFrontmatterStrict,
  markdownBodyToHtml,
  type ParsedFrontmatter,
} from "@/lib/blog/markdown-utils";
import BlogPostPreviewLayout, {
  type BlogPostPreviewMeta,
} from "@/components/blog/BlogPostPreviewLayout";

// Correct dynamic import for Monaco with proper typing
const MonacoEditor = dynamic<EditorProps>(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

const FRONTMATTER_TEMPLATE = `---
title: "Your Post Title"
summary: "Short 1–2 line description of the post."
author: "HubZero Team"
date: "2025-02-22"
category: "Design"
tags: ["ui", "ux", "branding"]
readingTimeMinutes: 5
---

# Introduction

Start writing your blog post content here.

Use proper headings:

## Section heading

- Bullet points
- Code blocks
- Images, etc.

`;

interface DownloadModalProps {
  isOpen: boolean;
  defaultSlug: string;
  onClose: () => void;
  onConfirm: (slug: string) => void;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Shape returned by parseFrontmatterStrict that we actually use here
interface FrontmatterResult {
  meta: ParsedFrontmatter;
  body: string;
  issues: string[];
}

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl">
        <h2 className="mb-3 text-lg font-semibold text-slate-50">
          How the HubZero Blog Editor Works
        </h2>

        <div className="space-y-3 text-sm text-slate-300">
          <p>
            This tool lets you write a HubZero blog post using Markdown with a
            strict frontmatter block at the top. The right side shows a live
            preview of the full blog page (header, content, footer).
          </p>

          <ol className="list-decimal space-y-2 pl-5">
            <li>Edit the frontmatter (title, summary, tags, etc.).</li>
            <li>
              Write your Markdown content below the frontmatter using headings,
              lists, code blocks, and images.
            </li>
            <li>Check the preview on the right to see the final layout.</li>
            <li>
              Fix any frontmatter issues shown in the yellow list if needed.
            </li>
            <li>
              When you&apos;re happy, click{" "}
              <span className="font-semibold">Download .md</span>.
            </li>
            <li>
              Send the downloaded file to{" "}
              <span className="font-semibold">Rifaque</span> to publish it on{" "}
              <span className="font-mono text-sky-300">
                hubzero.in/blog
              </span>
              .
            </li>
          </ol>

          <p className="text-xs text-slate-400">
            Tip: The editor uses the same engine as VS Code. Things like
            multi-cursor, Ctrl + D, Ctrl + /, and auto-indent all work here.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:border-slate-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const DownloadModal = ({
  isOpen,
  defaultSlug,
  onClose,
  onConfirm,
}: DownloadModalProps) => {
  const [slug, setSlug] = useState<string>(defaultSlug);

  useEffect(() => {
    setSlug(defaultSlug);
  }, [defaultSlug]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const safeSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!safeSlug) return;
    onConfirm(safeSlug);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-50">
          Name your markdown file
        </h2>
        <p className="mb-4 text-xs text-slate-400">
          This name will be used as the{" "}
          <span className="font-semibold">file name</span> and{" "}
          <span className="font-semibold">URL slug</span> for the blog post.
          <br />
          Example:{" "}
          <code className="text-[11px] text-sky-300">
            designing-bhatkal-time-luxe
          </code>
        </p>

        <label className="mb-2 block text-xs font-medium text-slate-300">
          File / slug name (no spaces)
        </label>
        <input
          type="text"
          value={slug}
          onChange={handleChange}
          className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
          placeholder="my-first-hubzero-post"
        />

        <p className="mb-4 text-[11px] text-amber-300">
          • This will appear in the browser address bar as{" "}
          <span className="font-mono text-amber-200">/blog/&lt;slug&gt;</span>.
        </p>

        <div className="mt-4 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-300 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 font-medium text-white"
          >
            Download .md
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BlogEditorPage() {
  const [markdown, setMarkdown] = useState<string>(FRONTMATTER_TEMPLATE);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [parsedMeta, setParsedMeta] = useState<ParsedFrontmatter | null>(null);
  const [issues, setIssues] = useState<string[]>([]);

  const frontmatterResult = useMemo<FrontmatterResult>(
    () => parseFrontmatterStrict(markdown) as FrontmatterResult,
    [markdown]
  );

  useEffect(() => {
    setParsedMeta(frontmatterResult.meta ?? null);
    setIssues(frontmatterResult.issues ?? []);
  }, [frontmatterResult]);

  useEffect(() => {
    let cancelled = false;

    async function convert() {
      try {
        const html = await markdownBodyToHtml(frontmatterResult.body ?? "");
        if (!cancelled) {
          setRenderedHtml(html);
        }
      } catch {
        if (!cancelled) {
          setRenderedHtml(
            "<p style='color:#f87171'>Error rendering markdown preview.</p>"
          );
        }
      }
    }

    void convert();

    return () => {
      cancelled = true;
    };
  }, [frontmatterResult.body]);

  const frontmatterValid = issues.length === 0;

  const titleFromFrontmatter = useMemo(() => {
    const t = frontmatterResult.meta?.title;
    return t && t !== "Untitled HubZero Post" ? t : "new-hubzero-post";
  }, [frontmatterResult.meta?.title]);

  const handleDownloadClick = useCallback(() => {
    if (!frontmatterValid) return;
    setIsModalOpen(true);
  }, [frontmatterValid]);

  const triggerDownload = useCallback(
    (slug: string) => {
      const filename = `${slug}.md`;
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsModalOpen(false);
      alert(
        `Downloaded ${filename}.\n\nNow send this file to Rifaque for publishing on hubzero.in/blog.`
      );
    },
    [markdown]
  );

  const handleEditorChange = useCallback((value: string | undefined) => {
    setMarkdown(value ?? "");
  }, []);

  const previewMeta: BlogPostPreviewMeta = useMemo(
    () => ({
      title: parsedMeta?.title ?? "Untitled HubZero Post",
      summary: parsedMeta?.summary ?? "",
      author: parsedMeta?.author ?? "HubZero Team",
      date: parsedMeta?.date ?? new Date().toISOString().slice(0, 10),
      category: parsedMeta?.category ?? "Uncategorized",
      tags: parsedMeta?.tags ?? [],
      readingTimeMinutes: parsedMeta?.readingTimeMinutes ?? 3,
    }),
    [parsedMeta]
  );

  const defaultSlug = useMemo(
    () =>
      titleFromFrontmatter
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    [titleFromFrontmatter]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* subtle background gradient */}
      <div className="pointer-events-none fixed inset-0 opacity-60 mix-blend-screen">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Bar */}
        <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-200 hover:border-sky-400"
                aria-label="Back to HubZero home"
              >
                ←
              </Link>
              <div>
                <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                  HubZero Blog Editor
                </h1>
                <p className="text-[11px] text-slate-500">
                  Left: Markdown. Right: Full blog page preview.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-medium text-slate-300 hover:border-sky-400"
                aria-label="How this editor works"
              >
                ?
              </button>

              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={!frontmatterValid}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition",
                  frontmatterValid
                    ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-md hover:shadow-lg"
                    : "cursor-not-allowed border border-slate-700 bg-slate-900 text-slate-500"
                )}
              >
                ⬇ Download .md
              </button>
            </div>
          </div>
        </header>

        {/* Info stripe */}
        <section className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-[11px] md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1 text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
                  Workflow
                </span>
                <span>
                  1) Edit Markdown &amp; frontmatter 2) Preview 3) Download 4)
                  Send to Rifaque
                </span>
              </div>
              {issues.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-[11px] text-amber-300">
                  {issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-1 text-slate-400 md:mt-0">
              <span
                className={clsx(
                  "mr-2 inline-block h-2 w-2 rounded-full",
                  frontmatterValid ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              {frontmatterValid
                ? "Frontmatter is valid. You can download."
                : "Fix the frontmatter above to enable download."}
            </div>
          </div>
        </section>

        {/* Main editor + preview */}
        <section className="flex flex-1 flex-col md:flex-row">
          {/* Editor side */}
          <div className="border-b border-slate-800 md:w-1/2 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] text-slate-400 md:px-5">
              <span className="font-medium uppercase tracking-[0.18em]">
                Markdown Editor
              </span>
              <span>Keep the frontmatter block at the top.</span>
            </div>

            <div className="h-[60vh] md:h-[calc(100vh-150px)]">
              <MonacoEditor
                height="100%"
                defaultLanguage="markdown"
                theme="vs-dark"
                value={markdown}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Preview side */}
          <div className="md:w-1/2">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] text-slate-400 md:px-5">
              <span className="font-medium uppercase tracking-[0.18em]">
                Blog Page Preview
              </span>
              <span>Full header, progress bar, content &amp; footer.</span>
            </div>

            <div className="h-[60vh] overflow-y-auto md:h-[calc(100vh-150px)]">
              <BlogPostPreviewLayout
                meta={previewMeta}
                contentHtml={renderedHtml}
              />
              <div className="px-4 pb-6 pt-3 text-[11px] text-slate-500 md:px-6">
                When you&apos;re happy with the preview, click{" "}
                <span className="font-semibold text-sky-300">Download .md</span>{" "}
                above and send the file to{" "}
                <span className="font-semibold">Rifaque</span> to publish it on
                hubzero.in.
              </div>
            </div>
          </div>
        </section>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <DownloadModal
        isOpen={isModalOpen}
        defaultSlug={defaultSlug}
        onClose={() => setIsModalOpen(false)}
        onConfirm={triggerDownload}
      />
    </main>
  );
}
