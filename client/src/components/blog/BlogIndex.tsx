"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogIndexProps {
  posts: BlogPostMeta[];
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [featured, ...rest] = posts;
  const list: BlogPostMeta[] = featured ? [featured, ...rest] : posts;

  // TS-safe category grouping
  const allCategories: string[] = Array.from(
    new Set(
      posts
        .map((p) => p.category ?? null)
        .filter((c): c is string => c !== null)
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Sticky header */}
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-40 border-b border-slate-800/70 backdrop-blur-sm transition-all",
          scrolled
            ? "translate-y-0 opacity-100"
            : "translate-y-0 opacity-100 md:-translate-y-full md:opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Back to HubZero home"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-400 text-base"
            >
              ←
            </Link>
            <div className="flex flex-col">
              <span className="font-semibold tracking-[0.22em] uppercase text-slate-400">
                HubZero Blog
              </span>
              <span className="hidden text-[11px] text-slate-500 md:inline">
                Design · Engineering · Strategy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 pt-20 md:pt-24">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen">
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-violet-500/40 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-14 pt-6 md:flex-row md:px-8 lg:px-16">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-medium tracking-[0.28em] text-slate-500">
              HUBZERO JOURNAL
            </p>

            <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl leading-snug">
              Stories at the intersection of{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                design, engineering
              </span>{" "}
              & strategy.
            </h1>

            <p className="mb-6 max-w-xl text-sm md:text-base text-slate-300">
              Case studies, visual experiments, and thoughts from building digital
              products for brands, startups, and local businesses.
            </p>

            {/* Categories */}
            {allCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {allCategories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:border-sky-400 transition"
              >
                ← Back to HubZero
              </Link>

              <Link
                href="#posts"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-lg"
              >
                Browse posts ↓
              </Link>
            </div>
          </div>

          {/* Featured card */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative w-full rounded-3xl border border-slate-700 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-sky-400/60 sm:max-w-md md:w-[360px] lg:w-[400px]"
            >
              <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),transparent_55%)]" />

              <div className="relative flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Featured
                </p>

                <h2 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl group-hover:underline">
                  {featured.title}
                </h2>

                {featured.summary && (
                  <p className="text-sm text-slate-300 md:text-[13px] leading-relaxed">
                    {featured.summary}
                  </p>
                )}

                {/* meta */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span>{featured.author}</span>

                  {featured.date && (
                    <>
                      <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                      <span>{new Date(featured.date).toLocaleDateString()}</span>
                    </>
                  )}

                  {featured.readingTimeMinutes && (
                    <>
                      <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                      <span>{featured.readingTimeMinutes} min read</span>
                    </>
                  )}
                </div>

                {/* tags */}
                {featured.tags && featured.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {featured.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-sky-500/40 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Promo strip */}
      <section className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4 md:px-8 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between md:text-sm">
          <p className="font-medium">
            Minimal ad space.{" "}
            <span className="font-normal text-slate-400">
              Reserve for announcements or promos.
            </span>
          </p>
          <div className="inline-flex rounded-2xl border border-dashed border-slate-700 px-4 py-2 text-[11px] text-slate-400">
            Placeholder · 320×80
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section
        id="posts"
        className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14 lg:px-16"
      >
        {list.length === 0 ? (
          <p className="text-slate-400">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <article
                key={post.slug}
                className="group relative flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-sky-500/60 hover:bg-slate-900"
              >
                <div className="flex flex-col gap-2">
                  {post.category && (
                    <span className="inline-flex w-fit rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {post.category}
                    </span>
                  )}

                  <h2 className="mt-1 text-lg font-medium tracking-tight md:text-xl text-slate-50">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  {post.summary && (
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 text-[11px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{post.author}</span>

                    {post.date && (
                      <>
                        <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </>
                    )}

                    {post.readingTimeMinutes && (
                      <>
                        <span className="h-[3px] w-[3px] rounded-full bg-slate-500" />
                        <span>{post.readingTimeMinutes} min read</span>
                      </>
                    )}
                  </div>

                  {/* tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[11px] font-medium text-sky-300 group-hover:text-sky-200 pt-1"
                  >
                    Read article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-xs md:text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
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
