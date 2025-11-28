"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import ReadingProgressBar from "./ReadingProgressBar";
import { useReadingProgress } from "./useReadingProgress";

interface BlogPostLayoutProps {
  post: BlogPost;
  morePosts: BlogPostMeta[];
}

export default function BlogPostLayout({ post, morePosts }: BlogPostLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const progress = useReadingProgress("blog-reading-root");

  useEffect(() => {
  // Just to inspect what you're actually rendering
  console.log(post.contentHtml);
}, [post.contentHtml]);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <ReadingProgressBar progress={progress} />

      {/* Sticky compact header */}
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-40 border-b border-slate-800/70 backdrop-blur-sm transition-all",
          scrolled
            ? "translate-y-0 opacity-100"
            : "translate-y-0 opacity-100 md:-translate-y-full md:opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2 text-xs md:text-sm">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-slate-400 hover:text-sky-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-base md:h-7 md:w-7">
              ←
            </span>
            <span className="hidden font-medium tracking-[0.16em] uppercase md:inline">
              HubZero Journal
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/70 pt-20 md:pt-24">
        {/* gradient lighting */}
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen">
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-violet-500/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-10 pt-6 md:px-8 md:pb-12">
          {/* Mobile back button */}
          <Link
            href="/blog"
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-sky-400 hover:text-sky-300 md:hidden"
          >
            <span className="text-base">←</span>
            Back to all posts
          </Link>

          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
            HubZero Journal
          </p>

          {/* Meta row */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>{post.author}</span>

            {post.date && (
              <>
                <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </>
            )}

            {typeof post.readingTimeMinutes === "number" && (
              <>
                <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
          </div>

          <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.summary && (
            <p className="max-w-2xl text-sm md:text-base text-slate-300">
              {post.summary}
            </p>
          )}

          {/* Category + tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.category && (
              <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {post.category}
              </span>
            )}

            {Array.isArray(post.tags) &&
              post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 text-[11px] md:flex-row md:items-center md:justify-between md:text-xs">
          <p className="text-slate-400">Light, optional ad slot.</p>
          <div className="rounded-xl border border-dashed border-slate-700 px-3 py-1 text-slate-400">
            468×60
          </div>
        </div>
      </section>

      {/* Reading body */}
      <article
        id="blog-reading-root"
        className={clsx(
          "mx-auto max-w-4xl px-4 py-8 md:py-10 2xl:px-[20vw] xl:px-[15vw] lg:px-[10vw]",
          "text-sm md:text-base text-slate-200",
          // Headings
          "[&_h1]:mt-8 [&&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight",
          "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold",
          "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
          // Paragraphs
          "[&_p]:mb-4",
          // Lists
          "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:mb-1",
          "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:mb-1",
          // Blockquotes
          "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_blockquote]:my-4",
          // Inline code
          "[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
          // Code blocks
          "[&_pre]:mb-6 [&_pre]:mt-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-800 [&_pre]:bg-slate-950/70 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.9em] [&_pre_code]:block [&_pre_code]:overflow-x-auto",
          // Links
          "[&_a]:text-sky-400 [&_a]:no-underline hover:[&_a]:underline",
          // Images
          "[&_img]:rounded-xl [&_img]:my-4 max-w-full"
        )}
      >
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>


      {/* Read more section */}
      {morePosts.length > 0 && (
        <section className="border-t border-slate-800 bg-slate-950 px-4 py-10 md:px-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold md:text-xl">Read more from HubZero</h2>

              <Link
                href="/blog"
                className="text-xs md:text-sm text-slate-400 hover:text-sky-300"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {morePosts.map((p) => (
                <article
                  key={p.slug}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs md:text-sm transition-all hover:border-sky-500/60"
                >
                  {p.category && (
                    <span className="mb-2 inline-flex rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {p.category}
                    </span>
                  )}

                  <h3 className="mb-2 text-sm font-medium md:text-base">
                    <Link href={`/blog/${p.slug}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </h3>

                  {p.summary && (
                    <p className="mb-3 line-clamp-3 text-slate-400">{p.summary}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    <span>{p.author}</span>

                    {p.date && (
                      <>
                        <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                        <span>{new Date(p.date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-xs md:text-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-slate-500">
            © {new Date().getFullYear()} HubZero Journal.
          </p>

          <div className="flex flex-wrap gap-3 text-slate-500">
            <Link href="/" className="hover:text-sky-400">
              HubZero Home
            </Link>
            <Link href="/team" className="hover:text-sky-400">
              Team
            </Link>
            <Link href="/contact" className="hover:text-sky-400">
              Work with us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
