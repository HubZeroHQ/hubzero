// src/lib/blog.ts
import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  readingTimeMinutes?: number;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
}

function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath);
  } catch {
    return false;
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function getPostSlugs(): string[] {
  if (!directoryExists(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".md"))
    .map((dirent) => dirent.name);
}

function normalizeTags(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) {
    return raw.map(String).map((t) => t.trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return undefined;
}

export function getAllPostsMeta(): BlogPostMeta[] {
  const slugs = getPostSlugs();

  const posts: BlogPostMeta[] = slugs
    .map((slugWithExtension) => {
      const realSlug = slugWithExtension.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, slugWithExtension);

      if (!fileExists(fullPath)) {
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data } = matter(fileContents) as matter.GrayMatterFile<string> & {
        data: Partial<BlogPostMeta> & Record<string, unknown>;
      };

      const tags = normalizeTags(data.tags);

      const meta: BlogPostMeta = {
        slug: realSlug,
        title:
          typeof data.title === "string" && data.title.length > 0
            ? data.title
            : realSlug,
        date: typeof data.date === "string" ? data.date : "",
        summary: typeof data.summary === "string" ? data.summary : "",
        author:
          typeof data.author === "string" && data.author.length > 0
            ? data.author
            : "HubZero Team",
        category:
          typeof data.category === "string" && data.category.length > 0
            ? data.category
            : undefined,
        tags,
        coverImage:
          typeof data.coverImage === "string" ? data.coverImage : undefined,
        readingTimeMinutes:
          typeof data.readingTimeMinutes === "number"
            ? data.readingTimeMinutes
            : undefined,
      };

      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null);

  return posts.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date > b.date ? -1 : 1;
  });
}

function estimateReadingTimeMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200)); // ~200 wpm
  return minutes;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  if (!fileExists(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents) as matter.GrayMatterFile<string> & {
    data: Partial<BlogPostMeta> & Record<string, unknown>;
  };

  const processedContent = await remark().use(html).process(content);
  const contentHtml = String(processedContent);

  const tags = normalizeTags(data.tags);
  const readingTimeMinutes = estimateReadingTimeMinutes(content);

  const meta: BlogPostMeta = {
    slug: realSlug,
    title:
      typeof data.title === "string" && data.title.length > 0
        ? data.title
        : realSlug,
    date: typeof data.date === "string" ? data.date : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    author:
      typeof data.author === "string" && data.author.length > 0
        ? data.author
        : "HubZero Team",
    category:
      typeof data.category === "string" && data.category.length > 0
        ? data.category
        : undefined,
    tags,
    coverImage:
      typeof data.coverImage === "string" ? data.coverImage : undefined,
    readingTimeMinutes,
  };

  return {
    ...meta,
    contentHtml,
  };
}
